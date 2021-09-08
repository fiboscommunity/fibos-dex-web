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

import { SpinWrapper } from 'Components'
import { getPrecision, getStrWithPrecision } from 'Utils'
import { pollInterval } from 'Config'

import moment from 'moment'

import noData from 'Assets/commons/noData.png'
import styles from './history-order-table.module.css'

class HistoryOrderTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { ironmanData } = this.props

    if (ironmanData) {
      this.requestForDataOfHistoryOrder()
    }
  }

  componentDidUpdate(prevProps) {
    const { ironmanData, pairId, historyOrderTableRequesting } = this.props

    if (ironmanData && !prevProps.ironmanData) {
      this.requestForDataOfHistoryOrder()
    }

    if (pairId !== prevProps.pairId) {
      this.requestForDataOfHistoryOrder()
    }

    if (historyOrderTableRequesting !== prevProps.historyOrderTableRequesting) {
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

  getColumns = () => [
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
      title: intl.get('STATUS'),
      dataIndex: 'status',
      key: 'status',
      render: (col, row) => {
        let tmpResult = '--'

        if (row) {
          if (col === 'complete') {
            tmpResult = intl.get('COMPLETE')
          }

          if (col === 'cancel') {
            tmpResult = intl.get('CANCELLED')
          }
        }

        return tmpResult
      },
    },
    {
      title: intl.get('DETAIL'),
      key: 'action',
      render: () => <Button className={styles.detailBtn}>{intl.get('DETAIL')}</Button>,
    },
  ]

  getExpandedRowRender = record => {
    if (record.deal.length === 0) {
      return <div className={styles.noDeals}>{intl.get('NO_DEALS')}</div>
    }

    const columns = [
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

          if (row) {
            if (row.direction === 'buy') {
              tmpResult = `${col.tokeny.id} => ${col.tokenx.id}`
            }

            if (row.direction === 'sell') {
              tmpResult = `${col.tokenx.id} => ${col.tokeny.id}`
            }
          }

          return tmpResult
        },
      },
      {
        title: `${intl.get('CHANGE_RATIO')}`,
        dataIndex: 'price',
        key: 'price',
        render: (col, row) => {
          const { tmpTokenYPre } = this.getMathEles(row)
          let tmpResult = null

          if (col) {
            if (row.direction === 'buy') {
              tmpResult = `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).div(
                  new BigNumber(row.tokenx_quantity).plus(row.fee),
                ),
                tmpTokenYPre,
                true,
              )}`
            }

            if (row.direction === 'sell') {
              tmpResult = `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).plus(row.fee).div(row.tokenx_quantity),
                tmpTokenYPre,
                true,
              )}`
            }
          }

          return `${1} : ${tmpResult}`
        },
      },
      {
        title: `${intl.get('EXCHANGE_AMOUNT')}`,
        dataIndex: 'tokenx_quantity',
        key: 'tokenx_quantity',
        render: (col, row) => {
          const { tmpTokenXPre } = this.getMathEles(row)

          if (col) {
            if (row.direction === 'buy') {
              return `${getStrWithPrecision(new BigNumber(col).plus(row.fee), tmpTokenXPre)} ${
                row.tokenpair.tokenx.id
              }`
            }

            if (row.direction === 'sell') {
              return `${col} ${row.tokenpair.tokenx.id}`
            }
          }

          return null
        },
      },
      {
        title: `${intl.get('EXCHANGE_QUANTITY')}`,
        dataIndex: 'tokeny_quantity',
        key: 'tokeny_quantity',
        render: (col, row) => {
          const { tmpTokenYPre } = this.getMathEles(row)

          if (col) {
            if (row.direction === 'buy') {
              return `${col} ${row.tokenpair.tokeny.id}`
            }

            if (row.direction === 'sell') {
              return `${getStrWithPrecision(new BigNumber(col).plus(row.fee), tmpTokenYPre)} ${
                row.tokenpair.tokeny.id
              }`
            }
          }

          return null
        },
      },
    ]

    return (
      <Table
        className={styles.innerTable}
        columns={columns}
        dataSource={record.deal}
        pagination={false}
      />
    )
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForDataOfHistoryOrder()
    }, pollInterval)

    return true
  }

  handleChangePage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('historyOrderDataPage', page)
    changeFieldValue('historyOrderTableSpinning', true)

    this.requestForDataOfHistoryOrder({
      page,
    })
  }

  requestForTotalOfHistoryOrder(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTotalOfHistoryOrder } = this.props

    requestForTotalOfHistoryOrder(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('historyOrderTableSpinning', false)
          changeFieldValue('historyOrderTableRequesting', false)
        },
      },
    )
  }

  requestForDataOfHistoryOrder(tableConfig) {
    const {
      ironmanData,

      pairId,

      historyOrderDataPage,
      historyOrderDataPageSize,
      changeFieldValue,
      requestForDataOfHistoryOrder,
    } = this.props

    const config = {
      page: historyOrderDataPage,
      pagesize: historyOrderDataPageSize,
      account: ironmanData && ironmanData.account ? ironmanData.account.name || '' : '',
      pairId,
      ...tableConfig,
    }

    changeFieldValue('historyOrderTableRequesting', true)
    this.requestForTotalOfHistoryOrder({ ...config }, () => {
      requestForDataOfHistoryOrder(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('historyOrderTableSpinning', false)
            changeFieldValue('historyOrderTableRequesting', false)
          },
          failCb: () => {
            changeFieldValue('historyOrderTableSpinning', false)
            changeFieldValue('historyOrderTableRequesting', false)
          },
        },
      )
    })
  }

  render() {
    const {
      historyOrderTableSpinning,

      historyOrderTableData,

      historyOrderDataTotal,
      historyOrderDataPage,
      historyOrderDataPageSize,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={historyOrderTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                rowKey={record => `${record.id}`}
                bordered={false}
                columns={this.getColumns()}
                dataSource={historyOrderTableData}
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
                expandedRowRender={this.getExpandedRowRender}
                expandRowByClick
                expandIconAsCell={false}
                expandIconColumnIndex={-1}
              />
            </LocaleProvider>
            {historyOrderDataTotal > 0 && (
              <LocaleProvider locale={zhCN}>
                <Pagination
                  className={styles.pagination}
                  current={historyOrderDataPage}
                  pageSize={historyOrderDataPageSize}
                  showLessItems={false}
                  total={historyOrderDataTotal}
                  onChange={this.handleChangePage}
                  showQuickJumper={false}
                  showTotal={total => {
                    const pageNumber = Math.ceil(total / historyOrderDataPageSize)

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

export default withRouter(HistoryOrderTable)
