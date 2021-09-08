import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
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
import { getStrWithPrecision, getPrecision, expectCal } from 'Utils'
import { pollInterval } from 'Config'

import moment from 'moment'

import noData from 'Assets/commons/noData.png'
import styles from './productions-table.module.css'

class ProductionsTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.requestForProductionsTableData()
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { productionsTableRequesting } = this.props

    if (productionsTableRequesting !== prevProps.productionsTableRequesting) {
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

  getRepoLimit = data => {
    if (!data) {
      return {
        val: null,
      }
    }

    const nowTime = moment(new Date()).unix()
    const endTime = moment(data).unix()

    const tmpVal = Math.floor((endTime - nowTime) / 3600 / 24)

    return tmpVal
  }

  getExpectValue = data => {
    const { amount, token, uniswapPrice, attributes, repoplan, sevenDaysAverage } = data

    if (
      !token ||
      !token.supply ||
      !uniswapPrice ||
      !repoplan ||
      !repoplan.endTime ||
      !amount ||
      !sevenDaysAverage
    ) {
      return null
    }

    const max = new BigNumber(token.supply).plus(token.reserve_supply).toNumber()

    const result = new BigNumber(uniswapPrice)
      .times(max)
      .div(amount)
      .toNumber()

    const duration = parseFloat(this.getRepoLimit(repoplan.endTime))

    const dayProfit = new BigNumber(sevenDaysAverage).div(amount).toNumber()

    const { residual } = attributes

    if (result && duration && !Number.isNaN(dayProfit)) {
      const calData = expectCal({
        result,
        duration,
        dayProfit,
        residual,
      })

      return getStrWithPrecision(new BigNumber(calData.data || 0).times(1e2), 2)
    }

    return null
  }

  getColumns = () => [
    {
      title: intl.get('PROJECT_NAME'),
      dataIndex: 'name',
      key: 'name',
      width: '16%',
      render: col => {
        if (col) {
          return col
        }

        return '--'
      },
    },
    {
      title: intl.get('ANNUALIZE_EARNINGS'),
      dataIndex: 'amount',
      key: 'amount',
      width: '16%',
      render: (col, row) => {
        if (col) {
          const val = this.getExpectValue(row)

          return `${val ? `${val}%` : '--'}`
        }

        return '--'
      },
    },
    {
      title: intl.get('LASTEST_REPO_SEVEN_DAYS'),
      dataIndex: 'sevenDaysAverage',
      key: 'sevenDaysAverage',
      width: '16%',
      render: col => {
        if (col) {
          return col
        }

        return '--'
      },
    },
    {
      title: intl.get('TOKEN'),
      dataIndex: 'token[id]',
      key: 'token[id]',
      width: '16%',
      render: col => {
        if (col) {
          return col
        }

        return '--'
      },
    },
    {
      title: intl.get('TOKEN_TOTAL_AMOUNT'),
      dataIndex: 'token[supply]',
      key: 'token[supply]',
      width: '16%',
      render: (col, row) => {
        if (row && row.token) {
          const tmpMax = new BigNumber(row.token.supply).plus(row.token.reserve_supply)

          return getStrWithPrecision(tmpMax, getPrecision(row.token.precision))
        }

        return '--'
      },
    },
    {
      title: intl.get('NEWEST_PRICE'),
      dataIndex: 'uniswapPrice',
      key: 'uniswapPrice',
      width: '16%',
      render: col => {
        if (col) {
          return col
        }

        return '--'
      },
    },
    {
      title: intl.get('STATUS'),
      dataIndex: 'status',
      key: 'status',
      width: '16%',
      render: col => {
        if (col) {
          if (col === 'up') {
            return intl.get('PRODUCTION_UP')
          }

          if (col === 'up') {
            return intl.get('PRODUCTION_DOWN')
          }
        }

        return '--'
      },
    },
    {
      title: intl.get('ACTIONS'),
      key: 'action',
      width: '5%',
      render: row => {
        if (Object.keys(row).length > 0 && row.status === 'up') {
          return (
            <Button
              className={styles.buyBtn}
              onClick={e => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()

                if (row && row.attributes) {
                  const {
                    attributes: { tokenx, tokeny, reverse },
                  } = row

                  const tmpUri = queryString.stringify({
                    x: !reverse ? tokenx : tokeny,
                    y: !reverse ? tokeny : tokenx,
                  })

                  const { history } = this.props

                  history.push({
                    pathname: '/exchange',
                    search: tmpUri,
                  })

                  return true
                }

                return true
              }}>
              {intl.get('BUY_PRODUCTION')}
            </Button>
          )
        }

        return null
      },
    },
  ]

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForProductionsTableData()
    }, pollInterval)

    return true
  }

  handleChangePage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('productionsDataPage', page)
    changeFieldValue('productionsTableSpinning', true)

    this.requestForProductionsTableData({
      page,
    })
  }

  requestForTableDataTotalOfProductions(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTableDataTotalOfProductions } = this.props

    requestForTableDataTotalOfProductions(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('productionsTableSpinning', false)
          changeFieldValue('productionsTableRequesting', false)
        },
      },
    )
  }

  requestForProductionsTableData(tableConfig) {
    const {
      productionsDataPage,
      productionsDataPageSize,
      changeFieldValue,
      requestForProductionsTableData,
    } = this.props

    const config = {
      page: productionsDataPage,
      pagesize: productionsDataPageSize,
      ...tableConfig,
    }

    changeFieldValue('productionsTableRequesting', true)
    this.requestForTableDataTotalOfProductions({ ...config }, () => {
      requestForProductionsTableData(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('productionsTableSpinning', false)
            changeFieldValue('productionsTableRequesting', false)
          },
          failCb: () => {
            changeFieldValue('productionsTableSpinning', false)
            changeFieldValue('productionsTableRequesting', false)
          },
        },
      )
    })
  }

  render() {
    const {
      productionsTableSpinning,

      tableData,

      productionsDataTotal,
      productionsDataPage,
      productionsDataPageSize,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={productionsTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                rowKey={record => `${record.id}`}
                bordered={false}
                columns={this.getColumns()}
                dataSource={tableData}
                pagination={false}
                onRow={record => {
                  const { id } = record

                  return {
                    onClick: () => {
                      this._goto(`/production/${id}`)
                    },
                  }
                }}
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
            <LocaleProvider locale={zhCN}>
              <Pagination
                className={styles.pagination}
                current={productionsDataPage}
                pageSize={productionsDataPageSize}
                showLessItems={false}
                total={productionsDataTotal}
                onChange={this.handleChangePage}
                showQuickJumper={false}
                showTotal={total => {
                  const pageNumber = Math.ceil(total / productionsDataPageSize)

                  return `${intl.get('TOTAL')} ${pageNumber} ${intl.get('PAGE')}`
                }}
              />
            </LocaleProvider>
          </SpinWrapper>
        </div>
      </div>
    )
  }
}

export default withRouter(ProductionsTable)
