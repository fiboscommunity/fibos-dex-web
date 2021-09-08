import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'
import moment from 'moment'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import Pagination from 'antd/lib/pagination'
import 'antd/lib/pagination/style/css'
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

import styles from './current-order-table.module.css'

class CurrentOrderTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { ironmanData } = this.props

    if (ironmanData) {
      this.requestForDataOfCurrentOrder()
    }
  }

  componentDidUpdate(prevProps) {
    const { ironmanData, pairId, currentOrderTableRequesting } = this.props

    if (ironmanData && !prevProps.ironmanData) {
      this.requestForDataOfCurrentOrder()
    }

    if (pairId !== prevProps.pairId) {
      this.requestForDataOfCurrentOrder()
    }

    if (currentOrderTableRequesting !== prevProps.currentOrderTableRequesting) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  reqWithdraw = (x, y, id, { tokenx, tokeny }) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
      requestingContract,

      changeFieldValue,
    } = this.props

    if (requestingContract) message.warning(intl.get('WAITING_FOR_REQUEST'))

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    const xPre = getPrecision(tokenx.precision)
    const yPre = getPrecision(tokeny.precision)

    if (fibos) {
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
      currentOrderTableData,
    } = this.props
    const { name, authority } = account

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      const actions = []
      let hasWaiting = false

      currentOrderTableData.forEach(item => {
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
          })
          .catch(() => {
            message.error(intl.get('ACTION_FAIL'))
          })
      } else {
        message.error(intl.get('NO_WAITING_DELEGATE'))
      }
    }

    return true
  }

  getMathEles = row => {
    const tmpTokenXPre = getPrecision(row.tokenpair.tokenx.precision)
    const tmpTokenYPre = getPrecision(row.tokenpair.tokeny.precision)

    const tmpTokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
    const tmpTokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

    return {
      tmpTokenXPre,
      tmpTokenYPre,
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
              tmpTokenxQuantityEqualZero,
              tmpTokenyQuantityEqualZero,
              tmpTokenXPre,
              tmpTokenYPre,
            } = this.getMathEles(row)

            const tmpTime = moment(new Date(row.created)).format('YYYY-MM-DD HH:mm:ss')
            let tmpDstToken = new Token()
            let tmpSrcToken = new Token()
            let tmpDirection = null
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

            if (tmpTokenxQuantityEqualZero) {
              tmpDstToken = new Token(row.tokenpair.tokenx)
              tmpSrcToken = new Token(row.tokenpair.tokeny)

              tmpExchangeRate = getStrWithPrecision(new BigNumber(row.price), tmpTokenYPre, true)

              tmpTraded = getStrWithPrecision(row.dealled, tmpTokenYPre)

              tmpUnsettled = getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).minus(row.dealled),
                tmpTokenYPre,
              )

              if (row.direction === 'buy') {
                tmpExchangeQuantity = getStrWithPrecision(
                  new BigNumber(row.tokeny_quantity).times(row.price),
                  tmpTokenXPre,
                )
              }

              if (row.direction === 'sell') {
                tmpExchangeQuantity = getStrWithPrecision(
                  new BigNumber(row.tokeny_quantity).div(row.price),
                  tmpTokenXPre,
                )
              }

              tmpExchangeAmount = row.tokeny_quantity
            }

            if (tmpTokenyQuantityEqualZero) {
              tmpDstToken = new Token(row.tokenpair.tokeny)
              tmpSrcToken = new Token(row.tokenpair.tokenx)

              tmpExchangeRate = getStrWithPrecision(new BigNumber(row.price), tmpTokenXPre, true)

              tmpTraded = getStrWithPrecision(row.dealled, tmpTokenXPre)

              tmpUnsettled = getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).minus(row.dealled),
                tmpTokenXPre,
              )

              if (row.direction === 'buy') {
                tmpExchangeQuantity = getStrWithPrecision(
                  new BigNumber(row.tokenx_quantity).div(row.price),
                  tmpTokenYPre,
                )
              }

              if (row.direction === 'sell') {
                tmpExchangeQuantity = getStrWithPrecision(
                  new BigNumber(row.tokenx_quantity).times(row.price),
                  tmpTokenYPre,
                )
              }

              tmpExchangeAmount = row.tokenx_quantity
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
                      {`${intl.get('TRADED')}(${tmpSrcToken.dslName})`}
                    </div>
                    <div className={styles.infovalue}>{tmpTraded}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('UNSETTLED')}(${tmpSrcToken.dslName})`}
                    </div>
                    <div className={styles.infovalue}>{tmpUnsettled}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('EXCHANGE_QUANTITY')}(${tmpDstToken.dslName})`}
                    </div>
                    <div className={styles.infovalue}>{tmpExchangeQuantity}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.infoLabel}>
                      {`${intl.get('AMOUNT')}(${tmpSrcToken.dslName})`}
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

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForDataOfCurrentOrder()
    }, pollInterval)

    return true
  }

  handleChangePage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('currentOrderDataPage', page)
    changeFieldValue('currentOrderTableSpinning', true)

    this.requestForDataOfCurrentOrder({
      page,
    })
  }

  requestForTotalOfCurrentOrder(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTotalOfCurrentOrder } = this.props

    requestForTotalOfCurrentOrder(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('currentOrderTableSpinning', false)
          changeFieldValue('currentOrderTableRequesting', false)
        },
      },
    )
  }

  requestForDataOfCurrentOrder(tableConfig = {}) {
    const {
      ironmanData,

      pairId,

      currentOrderDataPage,
      currentOrderDataPageSize,
      changeFieldValue,
      requestForDataOfCurrentOrder,
    } = this.props

    const config = {
      page: currentOrderDataPage,
      pagesize: currentOrderDataPageSize,
      account: ironmanData && ironmanData.account ? ironmanData.account.name || '' : '',
      pairId,
      ...tableConfig,
    }

    changeFieldValue('currentOrderTableRequesting', true)
    this.requestForTotalOfCurrentOrder({ ...config }, () => {
      requestForDataOfCurrentOrder(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('currentOrderTableSpinning', false)
            changeFieldValue('currentOrderTableRequesting', false)
          },
          failCb: () => {
            changeFieldValue('currentOrderTableSpinning', false)
            changeFieldValue('currentOrderTableRequesting', false)
          },
        },
      )
    })
  }

  render() {
    const {
      ironmanData,
      requestingContract,

      currentOrderTableSpinning,

      currentOrderTableData,

      currentOrderDataTotal,
      currentOrderDataPage,
      currentOrderDataPageSize,
    } = this.props

    return (
      <div className={styles.wrapper}>
        {ironmanData && currentOrderDataTotal > 0 && (
          <div className={styles.headWrapper}>
            <div className={styles.headText}>{intl.get('CURRENT')}</div>
            {ironmanData && (
              <Button
                className={styles.cancelBtn}
                loading={requestingContract}
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
          <SpinWrapper spinning={currentOrderTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                showHeader={false}
                rowKey={record => `${record.id}`}
                bordered={false}
                columns={this.getColumns()}
                dataSource={currentOrderTableData}
                pagination={false}
                locale={{
                  emptyText: (
                    <div className={styles.noDataWrapper}>
                      <div className={styles.noDataImgWrapper}>
                        <img className={styles.noDataImg} src={noData} alt="" />
                      </div>
                      <div className={styles.noDataText}>{intl.get('MARKET_NO_DATA')}</div>
                    </div>
                  ),
                }}
              />
            </LocaleProvider>
            {currentOrderDataTotal > 0 && (
              <LocaleProvider locale={zhCN}>
                <Pagination
                  className={styles.pagination}
                  current={currentOrderDataPage}
                  pageSize={currentOrderDataPageSize}
                  showLessItems={false}
                  total={currentOrderDataTotal}
                  onChange={this.handleChangePage}
                  showQuickJumper={false}
                  showTotal={total => {
                    const pageNumber = Math.ceil(total / currentOrderDataPageSize)

                    return `${intl.get('TOTAL')} ${pageNumber} ${intl.get('PAGE')}`
                  }}
                />
              </LocaleProvider>
            )}
          </SpinWrapper>
        </div>
      </div>
    )
  }
}

export default CurrentOrderTable
