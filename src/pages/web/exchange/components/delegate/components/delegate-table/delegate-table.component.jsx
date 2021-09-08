import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { SpinWrapper } from 'Components'
import { getPrecision, getStrWithPrecision, contractErrorCollector } from 'Utils'
import { pollInterval } from 'Config'

import moment from 'moment'

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

    return {
      tmpTokenXPre,
      tmpTokenYPre,
      tmpNeedToReverse,
    }
  }

  getColumns = () => {
    const { srcToken, dstToken, onlyCurrent, requestingContract } = this.props

    return [
      {
        title: intl.get('TIME'),
        dataIndex: 'created',
        key: 'created',
        width: '15%',
        render: col => {
          if (col) {
            return moment(new Date(col)).format('YYYY-MM-DD HH:mm:ss')
          }

          return null
        },
      },
      {
        title: intl.get('TRADE_PAIR'),
        dataIndex: 'tokenpair',
        key: 'tokenpair',
        width: '20%',
        render: (col, row) => {
          if (row) {
            const { tmpNeedToReverse } = this.getMathEles(row)

            if (tmpNeedToReverse) {
              return `${col.tokeny.id}/${col.tokenx.id}`
            }
            return `${col.tokenx.id}/${col.tokeny.id}`
          }

          return null
        },
      },
      {
        title: intl.get('TYPE'),
        dataIndex: 'direction',
        key: 'direction',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse } = this.getMathEles(row)

            if (tmpNeedToReverse) {
              if (col === 'buy') {
                tmpResult = <em className={styles.sell}>{intl.get('SELL')}</em>
              }

              if (col === 'sell') {
                tmpResult = <em className={styles.buy}>{intl.get('BUY')}</em>
              }
            }

            if (!tmpNeedToReverse) {
              if (col === 'buy') {
                tmpResult = <em className={styles.buy}>{intl.get('BUY')}</em>
              }

              if (col === 'sell') {
                tmpResult = <em className={styles.sell}>{intl.get('SELL')}</em>
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('EXCHANGE_PRICE')} ${!onlyCurrent ? '' : `(${srcToken.symbol})`}`,
        dataIndex: 'price',
        key: 'price',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse, tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

            if (tmpNeedToReverse) {
              if (row.direction === 'buy') {
                tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenXPre, true)}`
              }

              if (row.direction === 'sell') {
                tmpResult = `${getStrWithPrecision(new BigNumber(1).div(col), tmpTokenXPre, true)}`
              }
            }

            if (!tmpNeedToReverse) {
              if (row.direction === 'buy') {
                tmpResult = `${getStrWithPrecision(new BigNumber(1).div(col), tmpTokenYPre, true)}`
              }

              if (row.direction === 'sell') {
                tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenYPre, true)}`
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('AMOUNT')} ${!onlyCurrent ? '' : `(${dstToken.symbol})`}`,
        dataIndex: 'amount',
        key: 'amount',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse, tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

            const tokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
            const tokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

            let tmpPrice = 0
            if (tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).div(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).div(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }
            }

            if (!tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('TRADED')} ${!onlyCurrent ? '' : `(${dstToken.symbol})`}`,
        dataIndex: 'dealled',
        key: 'dealled',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse, tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

            const tokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
            const tokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

            let tmpPrice = 0
            if (tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(col).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(col, tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(col).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }
            }

            if (!tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(col).times(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenXPre)}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(col).times(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenXPre)}`
                }
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('UNSETTLED')} ${!onlyCurrent ? '' : `(${dstToken.symbol})`}`,
        dataIndex: 'unsettled',
        key: 'unsettled',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse, tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

            const tokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
            const tokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

            let tmpPrice = 0
            if (tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled),
                    tmpTokenYPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled),
                    tmpTokenYPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }
            }

            if (!tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled).times(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled),
                    tmpTokenXPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).minus(row.dealled).times(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).minus(row.dealled),
                    tmpTokenXPre,
                  )}`
                }
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('EXCHANGE_QUANTITY')} ${!onlyCurrent ? '' : `(${srcToken.symbol})`}`,
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: '10%',
        render: (col, row) => {
          let tmpResult = null

          if (row) {
            const { tmpNeedToReverse, tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

            const tokenxQuantityEqualZero = new BigNumber(row.tokenx_quantity).eq(0)
            const tokenyQuantityEqualZero = new BigNumber(row.tokeny_quantity).eq(0)

            let tmpPrice = 0
            if (tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokeny_quantity).div(tmpPrice),
                    tmpTokenXPre,
                  )}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity),
                    tmpTokenXPre,
                  )}`
                }
              }
            }

            if (!tmpNeedToReverse) {
              if (row.direction === 'buy') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(1).div(row.price)
                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }

              if (row.direction === 'sell') {
                if (tokenxQuantityEqualZero) {
                  tmpResult = `${getStrWithPrecision(row.tokeny_quantity, tmpTokenYPre)}`
                }

                if (tokenyQuantityEqualZero) {
                  tmpPrice = new BigNumber(row.price)

                  tmpResult = `${getStrWithPrecision(
                    new BigNumber(row.tokenx_quantity).times(tmpPrice),
                    tmpTokenYPre,
                  )}`
                }
              }
            }
          }

          return tmpResult
        },
      },
      {
        title: (
          <Button
            className={styles.cancelBtn}
            loading={requestingContract}
            onClick={() => {
              const { ironmanData } = this.props
              if (!ironmanData) return message.warning(intl.get('SHOULD_LOGIN_FIRST'))

              this.reqWithdrawAll()
              return true
            }}>
            {intl.get('CANCEL_ORDER_ALL')}
          </Button>
        ),
        // title: '',
        key: 'action',
        width: '5%',
        render: (col, row) => {
          const { ironmanData } = this.props
          if (!ironmanData) return null

          const {
            account: { name },
          } = ironmanData

          if (
            Object.keys(row).length > 0 &&
            row.status === 'waiting' &&
            row.account &&
            row.account.id === name
          ) {
            return (
              <Button
                className={styles.cancelBtn}
                loading={requestingContract}
                onClick={() => {
                  if (row) {
                    const { tokenpair } = row
                    const { tokenx, tokeny } = tokenpair

                    this.reqWithdraw(tokenx.id, tokeny.id, row.id)
                  }

                  return true
                }}>
                {intl.get('CANCEL_ORDER')}
              </Button>
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

      srcToken,
      dstToken,
      delegateDataPageSize,
      delegateData,
    } = this.props

    return (
      <SpinWrapper spinning={spinningDelegate}>
        <div className={styles.tableWrapper}>
          <LocaleProvider locale={zhCN}>
            <Table
              className={styles.table}
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
        </div>
      </SpinWrapper>
    )
  }
}

export default DelegateTable
