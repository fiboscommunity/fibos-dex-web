import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

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
import styles from './deals-table.module.css'

class DealsTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { ironmanData } = this.props

    if (ironmanData) {
      this.requestForDataOfDeals()
    }
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { ironmanData, pairId, dealsTableRequesting } = this.props

    if (ironmanData && !prevProps.ironmanData) {
      this.requestForDataOfDeals()
    }

    if (pairId !== prevProps.pairId) {
      this.requestForDataOfDeals()
    }

    if (dealsTableRequesting !== prevProps.dealsTableRequesting) {
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

    return {
      tmpTokenXPre,
      tmpTokenYPre,
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
    // {
    //   title: intl.get('TYPE'),
    //   dataIndex: 'direction',
    //   key: 'direction',
    //   render: col => {
    //     if (col === 'buy') {
    //       return <em className={styles.buy}>{intl.get('BUY')}</em>
    //     }

    //     if (col === 'sell') {
    //       return <em className={styles.sell}>{intl.get('SELL')}</em>
    //     }

    //     return null
    //   },
    // },
    // {
    //   title: intl.get('ACCOUNT'),
    //   dataIndex: 'fromaccount[id]',
    //   key: 'fromaccount[id]',
    // },
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

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForDataOfDeals()
    }, pollInterval)

    return true
  }

  handleChangePage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('dealsDataPage', page)
    changeFieldValue('dealsTableSpinning', true)

    this.requestForDataOfDeals({
      page,
    })
  }

  requestForTotalOfDeals(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTotalOfDeals } = this.props

    requestForTotalOfDeals(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('dealsTableSpinning', false)
          changeFieldValue('dealsTableRequesting', false)
        },
      },
    )
  }

  requestForDataOfDeals(tableConfig) {
    const {
      ironmanData,

      pairId,

      dealsDataPage,
      dealsDataPageSize,
      changeFieldValue,
      requestForDataOfDeals,
    } = this.props

    const config = {
      page: dealsDataPage,
      pagesize: dealsDataPageSize,
      account: ironmanData && ironmanData.account ? ironmanData.account.name || '' : '',
      pairId,
      ...tableConfig,
    }

    changeFieldValue('dealsTableRequesting', true)
    this.requestForTotalOfDeals({ ...config }, () => {
      requestForDataOfDeals(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('dealsTableSpinning', false)
            changeFieldValue('dealsTableRequesting', false)
          },
          failCb: () => {
            changeFieldValue('dealsTableSpinning', false)
            changeFieldValue('dealsTableRequesting', false)
          },
        },
      )
    })
  }

  render() {
    const {
      dealsTableSpinning,

      dealsTableData,

      dealsDataTotal,
      dealsDataPage,
      dealsDataPageSize,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={dealsTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                rowKey={record => `${record.id}`}
                bordered={false}
                columns={this.getColumns()}
                dataSource={dealsTableData}
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
            {dealsDataTotal > 0 && (
              <LocaleProvider locale={zhCN}>
                <Pagination
                  className={styles.pagination}
                  current={dealsDataPage}
                  pageSize={dealsDataPageSize}
                  showLessItems={false}
                  total={dealsDataTotal}
                  onChange={this.handleChangePage}
                  showQuickJumper={false}
                  showTotal={total => {
                    const pageNumber = Math.ceil(total / dealsDataPageSize)

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

export default withRouter(DealsTable)
