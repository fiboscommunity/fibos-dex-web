import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'
import moment from 'moment'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { Token } from 'Datasets'
import { SpinWrapper } from 'Components'
import { getPrecision, getStrWithPrecision, contractErrorCollector } from 'Utils'
import { pollInterval } from 'Config'

import noData from 'Assets/commons/noData.png'

import styles from './delegate-table.module.css'

class DelegateTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { ironmanData, pairId, changeFieldValue } = this.props

    if (ironmanData && pairId) {
      changeFieldValue('spinningDelegate', true)

      this.requestForTableDataOfDelegate()
    }
  }

  componentDidUpdate(prevProps) {
    const {
      requestingDelegate,

      ironmanData,
      srcToken,
      dstToken,
      onlyCurrent,
      tradingType,

      changeFieldValue,
      resetDelegate,
    } = this.props

    if (
      ironmanData &&
      ((dstToken.tokenName &&
        srcToken.tokenName &&
        (prevProps.dstToken.tokenName !== dstToken.tokenName ||
          prevProps.srcToken.tokenName !== srcToken.tokenName)) ||
        (tradingType && tradingType !== prevProps.tradingType) ||
        prevProps.onlyCurrent !== onlyCurrent)
    ) {
      this.requestForTableDataOfDelegate()
    }

    if (ironmanData && !prevProps.ironmanData) {
      changeFieldValue('spinningDelegate', true)

      this.requestForTableDataOfDelegate()
    }

    if (
      ironmanData &&
      ironmanData.fibos &&
      !requestingDelegate &&
      requestingDelegate !== prevProps.requestingDelegate
    ) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    if (
      (!ironmanData || !ironmanData.fibos) &&
      (prevProps.ironmanData && prevProps.ironmanData.fibos)
    ) {
      clearTimeout(this.timeout)
    }

    if (
      (!ironmanData || !ironmanData.fibos) &&
      (prevProps.ironmanData && prevProps.ironmanData.fibos)
    ) {
      resetDelegate()
    }

    return null
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  startPoll = () => {
    const { ironmanData } = this.props
    const { fibos } = ironmanData

    if (!fibos) return

    this.timeout = setTimeout(() => {
      this.requestForTableDataOfDelegate()
    }, pollInterval)
  }

  reqWithdraw = (x, y, id) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
      srcToken,
      dstToken,
      requestingContract,

      changeFieldValue,
    } = this.props

    if (requestingContract) message.warning(intl.get('WAITING_FOR_REQUEST'))

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      const xPre = x === srcToken.tokenName ? srcToken.pre : srcToken.pre
      const yPre = y === dstToken.tokenName ? dstToken.pre : dstToken.pre

      const reqData = {
        owner: name,
        x: `${getStrWithPrecision(0, xPre)} ${x}`,
        y: `${getStrWithPrecision(0, yPre)} ${y}`,
        bid_id: id,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .withdraw(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  reqWithdrawAll = () => {
    const {
      ironmanData: { fibos, account },
      delegateData,
      requestingContract,

      changeFieldValue,
    } = this.props
    const { name, authority } = account

    if (requestingContract) message.warning(intl.get('WAITING_FOR_REQUEST'))

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      const actions = []
      let hasWaiting = false

      delegateData.forEach(item => {
        const { tokenpair, status } = item
        const { tokenx, tokeny } = tokenpair
        if (!hasWaiting && status === 'waiting') {
          hasWaiting = true
        } else if (status !== 'waiting') {
          return
        }

        const xPre = getPrecision(item.tokenx_precision) || 0
        const yPre = getPrecision(item.tokeny_precision) || 0

        const tmp = {
          account: 'eosio.token',
          name: 'withdraw',
          authorization: [
            {
              actor: name,
              permission: authority,
            },
          ],
          data: {
            owner: name,
            x: `${getStrWithPrecision(0, xPre)} ${tokenx.id}`,
            y: `${getStrWithPrecision(0, yPre)} ${tokeny.id}`,
            bid_id: item.id,
          },
        }

        actions.push(tmp)
      })

      if (hasWaiting) {
        changeFieldValue('requestingContract', true)

        fibos
          .transaction({
            actions,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(() => {
            message.error(intl.get('ACTION_FAIL'))

            changeFieldValue('requestingContract', false)
          })
      } else {
        message.error(intl.get('NO_WAITING_DELEGATE'))
      }
    }

    return true
  }

  getMathEles = row => {
    const { srcToken, dstToken } = this.props
    const srcTokenName = srcToken.tokenName
    const dstTokenName = dstToken.tokenName

    const tmpTokenXPre = getPrecision(row.tokenpair.tokenx.precision)
    const tmpTokenYPre = getPrecision(row.tokenpair.tokeny.precision)

    const { tokenpair } = row
    const { tokenx, tokeny } = tokenpair

    let tmpNeedToReverse = false

    if (tokeny.id === dstTokenName && tokenx.id === srcTokenName) {
      tmpNeedToReverse = true
    }

    const tmpTokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
    const tmpTokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

    return {
      tmpTokenXPre,
      tmpTokenYPre,

      tmpNeedToReverse,

      tmpTokenxQuantityEqualZero,
      tmpTokenyQuantityEqualZero,
    }
  }

  getColumns = () => {
    const { ironmanData, requestingContract } = this.props

    return [
      {
        title: null,
        key: 'action',
        render: (col, row) => {
          const {
            account: { name },
          } = ironmanData

          if (
            Object.keys(row).length > 0 &&
            row.status === 'waiting' &&
            row.account &&
            row.account.id === name
          ) {
            const {
              tmpTokenXPre,
              tmpTokenYPre,
              tmpNeedToReverse,
              tmpTokenxQuantityEqualZero,
              tmpTokenyQuantityEqualZero,
            } = this.getMathEles(row)

            const tmpTime = moment(new Date(row.created)).format('MM-DD HH:mm:ss')
            let tmpDstToken = new Token()
            let tmpSrcToken = new Token()
            let tmpDirection = null
            let tmpPrice = null
            let tmpExchangeRate = null
            let tmpTraded = null
            let tmpUnsettled = null
            let tmpExchangeQuantity = null
            let tmpExchangeAmount = null

            if (row.direction === 'buy') {
              tmpDirection = `${row.tokenpair.tokeny.id} => ${row.tokenpair.tokenx.id}`
            }

            if (row.direction === 'sell') {
              tmpDirection = `${row.tokenpair.tokenx.id} => ${row.tokenpair.tokeny.id}`
            }

            if (tmpNeedToReverse) {
              tmpDstToken = new Token(row.tokenpair.tokeny)
              tmpSrcToken = new Token(row.tokenpair.tokenx)

              if (row.direction === 'buy') {
                tmpPrice = new BigNumber(row.price)
                tmpExchangeRate = `${getStrWithPrecision(tmpPrice, tmpTokenXPre, true)}`

                if (tmpTokenxQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(new BigNumber(row.dealled), tmpTokenYPre)}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).times(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tmpTokenyQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(
                    new BigNumber(row.dealled).div(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled).div(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).div(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                tmpPrice = new BigNumber(1).div(row.price)
                tmpExchangeRate = `${getStrWithPrecision(tmpPrice, tmpTokenYPre, true)}`

                if (tmpTokenxQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(row.dealled, tmpTokenYPre)}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).times(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tmpTokenyQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(
                    new BigNumber(row.dealled).times(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled).div(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).div(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }
            }

            if (!tmpNeedToReverse) {
              tmpDstToken = new Token(row.tokenpair.tokenx)
              tmpSrcToken = new Token(row.tokenpair.tokeny)

              if (row.direction === 'buy') {
                tmpPrice = new BigNumber(1).div(row.price)
                tmpExchangeRate = `${getStrWithPrecision(tmpPrice, tmpTokenYPre, true)}`

                if (tmpTokenxQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(
                    new BigNumber(row.dealled).div(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled).div(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tmpTokenyQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(new BigNumber(row.dealled), tmpTokenXPre)}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).times(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                tmpPrice = new BigNumber(row.price)
                tmpExchangeRate = `${getStrWithPrecision(tmpPrice, tmpTokenYPre, true)}`

                if (tmpTokenxQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(
                    new BigNumber(row.dealled).times(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled).times(tmpPrice),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tmpTokenyQuantityEqualZero) {
                  tmpTraded = `${getStrWithPrecision(new BigNumber(row.dealled), tmpTokenXPre)}`

                  tmpUnsettled = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled),
                    tmpTokenXPre,
                  )}`

                  tmpExchangeQuantity = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).times(tmpPrice),
                    tmpTokenYPre,
                  )}`

                  tmpExchangeAmount = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }
            }

            return (
              <div className={styles.cardWrapper}>
                <div className={styles.titleRow}>
                  <div className={styles.time}>{tmpTime}</div>
                  {ironmanData && (
                    <Button
                      className={styles.cancelBtnWithBorder}
                      loading={requestingContract}
                      onClick={() => {
                        if (row) {
                          const { tokenpair } = row
                          const { tokenx, tokeny } = tokenpair

                          this.reqWithdraw(tokenx.id, tokeny.id, row.id, row.tokenpair)
                        }

                        return true
                      }}>
                      {intl.get('CANCEL_ORDER')}
                    </Button>
                  )}
                </div>
                <div className={styles.pairWrapper}>
                  {/* <div className={styles.pair}>
                    <div className={classnames(styles.symbol, styles.dsttoken)}>
                      {tmpDstToken.tokenContract === 'eosio'
                        ? `${tmpDstToken.tokenSymbol}/`
                        : `${tmpDstToken.tokenSymbol}`}
                    </div>
                    <div className={styles.contract}>
                      {tmpDstToken.tokenContract === 'eosio'
                        ? ''
                        : `@${tmpDstToken.tokenContract}/`}
                    </div>
                  </div>
                  <div className={styles.pair}>
                    <div className={classnames(styles.symbol, styles.srctoken)}>
                      {`${tmpSrcToken.tokenSymbol}`}
                    </div>
                    <div className={styles.contract}>
                      {tmpSrcToken.tokenContract === 'eosio' ? '' : `@${tmpSrcToken.tokenContract}`}
                    </div>
                  </div> */}

                  <div className={styles.pair}>
                    <div className={classnames(styles.symbol, styles.dsttoken)}>{tmpDirection}</div>
                  </div>
                </div>
                <div className={styles.exchangeRateRow}>
                  <div className={styles.exchangeRate}>{`${intl.get('CHANGE_RATIO')}`}</div>
                  <div className={styles.infovalue}>{`${1} : ${tmpExchangeRate}`}</div>
                </div>
                <div className={styles.infosWrapper}>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('TRADED')}(${
                        tmpNeedToReverse ? tmpDstToken.dslName : tmpSrcToken.dslName
                      })`}
                    </div>
                    <div className={styles.infovalue}>{tmpTraded}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('UNSETTLED')}(${
                        tmpNeedToReverse ? tmpDstToken.dslName : tmpSrcToken.dslName
                      })`}
                    </div>
                    <div className={styles.infovalue}>{tmpUnsettled}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('EXCHANGE_QUANTITY')}(${
                        tmpNeedToReverse ? tmpSrcToken.dslName : tmpDstToken.dslName
                      })`}
                    </div>
                    <div className={styles.infovalue}>{tmpExchangeQuantity}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('AMOUNT')}(${
                        tmpNeedToReverse ? tmpDstToken.dslName : tmpSrcToken.dslName
                      })`}
                    </div>
                    <div className={styles.infovalue}>{tmpExchangeAmount}</div>
                  </div>
                </div>
              </div>
            )
          }

          return null
        },
      },
    ]
  }

  requestForTableDataOfDelegate() {
    const { ironmanData, pairId, delegateDataPage, delegateDataPageSize, onlyCurrent } = this.props

    let tableConfig = {
      page: delegateDataPage,
      pagesize: delegateDataPageSize,
    }

    if (ironmanData && ironmanData.account && ironmanData.account.name) {
      tableConfig = {
        ...tableConfig,
        account: ironmanData.account.name,
        pairId,
      }
    }

    if (!onlyCurrent) {
      tableConfig = {
        ...tableConfig,
        pairId: null,
      }
    }

    const { changeFieldValue, requestForTableDataOfDelegate } = this.props

    changeFieldValue('requestingDelegate', true)
    requestForTableDataOfDelegate(
      { ...tableConfig },
      {
        successCb: () => {
          changeFieldValue('spinningDelegate', false)
          changeFieldValue('requestingDelegate', false)
        },
        failCb: () => {
          changeFieldValue('spinningDelegate', false)
          changeFieldValue('requestingDelegate', false)
        },
      },
    )
  }

  render() {
    const {
      spinningDelegate,
      ironmanData,

      srcToken,
      dstToken,
      delegateDataPageSize,
      delegateData,
    } = this.props

    return (
      <div className={styles.wrapper}>
        {ironmanData && delegateDataPageSize > 0 && (
          <div className={styles.headWrapper}>
            <div className={styles.headText}>{intl.get('CURRENT')}</div>
            {ironmanData && (
              <Button
                className={styles.cancelBtn}
                loading={spinningDelegate}
                onClick={() => {
                  if (!ironmanData) return message.warning(intl.get('SHOULD_LOGIN_FIRST'))

                  this.reqWithdrawAll()
                  return true
                }}>
                {intl.get('CANCEL_ORDER_ALL')}
              </Button>
            )}
          </div>
        )}
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={spinningDelegate}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                showHeader={false}
                columns={this.getColumns(srcToken, dstToken)}
                dataSource={delegateData}
                pagination={{
                  hideOnSinglePage: true,
                  showLessItems: false,
                  showQuickJumper: false,
                  pageSize: delegateDataPageSize,
                  showTotal: total => {
                    const pageNumber = Math.ceil(total / delegateDataPageSize)

                    return `${intl.get('TOTAL')} ${pageNumber} ${intl.get('PAGE')}`
                  },
                }}
                locale={{
                  emptyText: (
                    <div className={styles.noDataWrapper}>
                      <div className={styles.noDataImgWrapper}>
                        <img className={styles.noDataImg} src={noData} alt="" />
                      </div>
                      <div className={styles.noDataText}>{intl.get('DELEGATE_NO_DATA')}</div>
                    </div>
                  ),
                }}
              />
            </LocaleProvider>
          </SpinWrapper>
        </div>
      </div>
    )
  }
}

export default DelegateTable
