import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'

import { SpinWrapper } from 'Components'
import { getStrWithPrecision } from 'Utils'
import { pollInterval } from 'Config'

import noData from 'Assets/commons/noData.png'
import styles from './tokenpairs-table.module.css'

class TokenTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.requestForTableData()
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { tokenTableRequesting } = this.props

    if (tokenTableRequesting !== prevProps.tokenTableRequesting) {
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

  requestForTableData = () => {
    const { changeFieldValue, requestForTableData } = this.props

    changeFieldValue('tokenTableRequesting', true)

    requestForTableData({
      successCb: () => {
        changeFieldValue('tokenTableSpinning', false)
        changeFieldValue('tokenTableRequesting', false)
      },
      failCb: () => {
        changeFieldValue('tokenTableSpinning', false)
        changeFieldValue('tokenTableRequesting', false)
      },
    })
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForTableData()
    }, pollInterval)

    return true
  }

  getColumns = () => {
    const { npriceSort, dayRateSort } = this.props

    return [
      {
        title: intl.get('TRADING_PAIR'),
        dataIndex: 'tokenxName',
        key: 'tokenxName',
        width: '45%',
        render: (col, row) => {
          if (col) {
            return (
              <div className={styles.pairWrapper}>
                <div className={styles.pair}>
                  <div className={classnames(styles.symbol, styles.srctoken)}>
                    {row.tokenxContract === 'eosio'
                      ? `${row.tokenxSymbol}/`
                      : `${row.tokenxSymbol}`}
                  </div>
                  <div className={styles.contract}>
                    {row.tokenxContract === 'eosio' ? '' : `@${row.tokenxContract}/`}
                  </div>
                </div>

                <div className={styles.pair}>
                  <div className={classnames(styles.symbol, styles.dsttoken)}>
                    {`${row.tokenySymbol}`}
                  </div>
                  <div className={classnames(styles.contract, styles.dsttoken)}>
                    {row.tokenyContract === 'eosio' ? '' : `@${row.tokenyContract}`}
                  </div>
                </div>
              </div>
            )
          }

          return null
        },
      },
      {
        title: intl.get('NEWEST_PRICE_PAIR'),
        dataIndex: 'uniswapPriceBN',
        key: 'uniswapPriceBN',
        width: '25%',
        sortOrder: npriceSort,
        sorter: (a, b) => {
          let tmpA = 0
          if (a.uniswapPrice && !a.uniswapPriceBN.isNaN()) {
            tmpA = a.uniswapPrice
          }

          let tmpB = 0
          if (b.uniswapPrice && !b.uniswapPriceBN.isNaN()) {
            tmpB = b.uniswapPrice
          }

          const res = tmpA - tmpB

          return res
        },
        render: (col, row) => {
          if (col) {
            const tmp = new BigNumber(getStrWithPrecision(col, row.tokenyPre))
            return `${tmp.toFormat()}${row.newestToCNY ? ` ≈ ¥${row.newestToCNY}` : ''}`
          }

          if (Object.keys(row).length === 0) return null

          return '--'
        },
      },
      {
        title: intl.get('DAY_RATE3'),
        dataIndex: 'dayRate',
        key: 'dayRate',
        width: '30%',
        sortOrder: dayRateSort,
        sorter: (a, b) => {
          let tmpA = new BigNumber(0)
          if (a.dayRateBN && !a.dayRateBN.isNaN()) {
            tmpA = a.dayRateBN
          }

          let tmpB = new BigNumber(0)
          if (b.dayRateBN && !b.dayRateBN.isNaN()) {
            tmpB = b.dayRateBN
          }

          return tmpA.minus(tmpB).toNumber()
        },
        render: (col, row) => {
          if (col && row) {
            const { dayRateDrection } = row

            if (new BigNumber(col).eq(0)) {
              return (
                <div className={styles.rateZero}>
                  <div className={styles.rateSymbol}>+</div>
                  <div className={styles.rateNumber}>{` ${'0.00'} %`}</div>
                </div>
              )
            }

            return (
              <div className={dayRateDrection === 'down' ? styles.rateDown : styles.rateUp}>
                <div className={styles.rateSymbol}>
                  {`${dayRateDrection === 'down' ? '-' : '+'}`}
                </div>
                <div className={styles.rateNumber}>{`${col} %`}</div>
              </div>
            )
          }

          return null
        },
      },
    ]
  }

  render() {
    const {
      match,

      tokenTableSpinning,
      tableData,

      changeSorters,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={tokenTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                rowKey={record => `${record.tokenxName}/${record.tokenyName}`}
                bordered
                columns={this.getColumns()}
                dataSource={tableData}
                pagination={false}
                onChange={(pagination, filters, sorter) => {
                  if (sorter && Object.keys(sorter).length > 0) {
                    changeSorters(sorter.field, sorter.order)
                  } else {
                    changeSorters('__reset')
                  }
                }}
                onRow={record => {
                  const { tokenxName, tokenyName } = record

                  return {
                    onClick: () => {
                      if (tokenxName && tokenyName) {
                        const tmpUri = queryString.stringify({
                          x: tokenxName,
                          y: tokenyName,
                        })

                        this._goto(
                          match.path.indexOf('/app') >= 0 ? '/app/exchange' : '/mobile/exchange',
                          tmpUri,
                        )
                      }

                      return true
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
          </SpinWrapper>
        </div>
      </div>
    )
  }
}

export default withRouter(TokenTable)
