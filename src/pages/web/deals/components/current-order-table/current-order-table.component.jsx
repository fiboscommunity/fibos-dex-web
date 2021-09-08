import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

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

import { SpinWrapper } from 'Components'
import { getPrecision, getStrWithPrecision, contractErrorCollector } from 'Utils'
import { pollInterval } from 'Config'

import moment from 'moment'

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

  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
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
    const { ironmanData, currentOrderDataTotal, requestingContract } = this.props

    return [
      {
        title: intl.get('TIME'),
        dataIndex: 'created',
        key: 'created',
        render: col => {
          if (col) {
            return moment(new Date(col)).format('YYYY-MM-DD HH:mm:ss')
          }

          return null
        },
      },
      {
        title: intl.get('CHANGE_TYPE'),
        dataIndex: 'tokenpair',
        key: 'tokenpair',
        render: (col, row) => {
          let tmpResult = null

          // if (tmpTokenxQuantityEqualZero) {
          //   tmpResult = `${col.tokeny.id} => ${col.tokenx.id}`
          // }

          // if (tmpTokenyQuantityEqualZero) {
          //   tmpResult = `${col.tokenx.id} => ${col.tokeny.id}`
          // }

          if (row.direction === 'buy') {
            tmpResult = `${row.tokenpair.tokeny.id} => ${row.tokenpair.tokenx.id}`
          }

          if (row.direction === 'sell') {
            tmpResult = `${row.tokenpair.tokenx.id} => ${row.tokenpair.tokeny.id}`
          }

          return tmpResult
        },
      },
      // {
      //   title: intl.get('TYPE'),
      //   dataIndex: 'direction',
      //   key: 'direction',
      //   width: '10%',
      //   render: (col, row) => {
      //     let tmpResult = null

      //     if (row) {
      //       if (col === 'buy') {
      //         tmpResult = <em >{intl.get('BUY')}</em>
      //       }

      //       if (col === 'sell') {
      //         tmpResult = <em className={styles.sell}>{intl.get('SELL')}</em>
      //       }
      //     }

      //     return tmpResult
      //   },
      // },
      {
        title: `${intl.get('CHANGE_RATIO')}`,
        dataIndex: 'price',
        key: 'price',
        render: (col, row) => {
          let tmpResult = null

          const { tmpTokenxQuantityEqualZero, tmpTokenyQuantityEqualZero } = this.getMathEles(row)

          if (tmpTokenxQuantityEqualZero) {
            const { tmpTokenYPre } = this.getMathEles(row)

            tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenYPre, true)}`
          }

          if (tmpTokenyQuantityEqualZero) {
            const { tmpTokenXPre } = this.getMathEles(row)

            tmpResult = `${getStrWithPrecision(new BigNumber(col), tmpTokenXPre, true)}`
          }

          return `${1} : ${tmpResult}`
        },
      },
      {
        title: `${intl.get('AMOUNT')}`,
        dataIndex: 'tokeny_quantity',
        key: 'tokeny_quantity',
        render: (col, row) => {
          const { tmpTokenxQuantityEqualZero, tmpTokenyQuantityEqualZero } = this.getMathEles(row)

          if (tmpTokenxQuantityEqualZero) {
            return `${row.tokeny_quantity} ${row.tokenpair.tokeny.id}`
          }

          if (tmpTokenyQuantityEqualZero) {
            return `${row.tokenx_quantity} ${row.tokenpair.tokenx.id}`
          }

          return null
        },
      },
      {
        title: `${intl.get('TRADED')}`,
        dataIndex: 'dealled',
        key: 'dealled',
        render: (col, row) => {
          const { tmpTokenxQuantityEqualZero, tmpTokenyQuantityEqualZero } = this.getMathEles(row)

          if (tmpTokenxQuantityEqualZero) {
            const { tmpTokenYPre } = this.getMathEles(row)

            return `${getStrWithPrecision(col, tmpTokenYPre)} ${row.tokenpair.tokeny.id}`
          }

          if (tmpTokenyQuantityEqualZero) {
            const { tmpTokenXPre } = this.getMathEles(row)

            return `${getStrWithPrecision(col, tmpTokenXPre)} ${row.tokenpair.tokenx.id}`
          }

          return null
        },
      },
      {
        title: `${intl.get('UNSETTLED')}`,
        dataIndex: 'unsettled',
        key: 'unsettled',
        render: (col, row) => {
          const { tmpTokenxQuantityEqualZero, tmpTokenyQuantityEqualZero } = this.getMathEles(row)

          if (tmpTokenxQuantityEqualZero) {
            const { tmpTokenYPre } = this.getMathEles(row)

            return `${getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).minus(row.dealled),
              tmpTokenYPre,
            )} ${row.tokenpair.tokeny.id}`
          }

          if (tmpTokenyQuantityEqualZero) {
            const { tmpTokenXPre } = this.getMathEles(row)

            return `${getStrWithPrecision(
              new BigNumber(row.tokenx_quantity).minus(row.dealled),
              tmpTokenXPre,
            )} ${row.tokenpair.tokenx.id}`
          }

          return null
        },
      },
      {
        title: `${intl.get('EXCHANGE_QUANTITY')}`,
        dataIndex: 'tokenx_quantity',
        key: 'tokenx_quantity',
        render: (col, row) => {
          const { tmpTokenxQuantityEqualZero, tmpTokenyQuantityEqualZero } = this.getMathEles(row)

          if (tmpTokenxQuantityEqualZero) {
            const { tmpTokenXPre } = this.getMathEles(row)

            if (row.direction === 'buy') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).times(row.price),
                tmpTokenXPre,
              )} ${row.tokenpair.tokenx.id}`
            }

            if (row.direction === 'sell') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).div(row.price),
                tmpTokenXPre,
              )} ${row.tokenpair.tokenx.id}`
            }
          }

          if (tmpTokenyQuantityEqualZero) {
            const { tmpTokenYPre } = this.getMathEles(row)

            if (row.direction === 'buy') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).div(row.price),
                tmpTokenYPre,
              )} ${row.tokenpair.tokeny.id}`
            }

            if (row.direction === 'sell') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).times(row.price),
                tmpTokenYPre,
              )} ${row.tokenpair.tokeny.id}`
            }
          }

          return null
        },
      },
      {
        title:
          ironmanData && currentOrderDataTotal > 0 ? (
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
          ) : null,
        key: 'action',
        render: (col, row) => {
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

                    this.reqWithdraw(tokenx.id, tokeny.id, row.id, row.tokenpair)
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
      currentOrderTableSpinning,

      currentOrderTableData,

      currentOrderDataTotal,
      currentOrderDataPage,
      currentOrderDataPageSize,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={currentOrderTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
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

export default withRouter(CurrentOrderTable)
