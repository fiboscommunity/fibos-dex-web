import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'

import { SpinWrapper } from 'Components'
import { getStrWithPrecision } from 'Utils'
import { pollInterval } from 'Config'

import noData from 'Assets/commons/noData.png'
import styles from './token-table.module.css'

class TokenTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { srcToken } = this.props

    this.requestForTableData(srcToken)
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

  requestForTableData = token => {
    const { srcToken, changeFieldValue, requestForTableData } = this.props

    changeFieldValue('tokenTableRequesting', true)

    requestForTableData(
      { srcTokenName: token },
      {
        successCb: () => {
          if (srcToken !== token) {
            changeFieldValue('srcToken', token)
          }
          changeFieldValue('tokenTableSpinning', false)
          changeFieldValue('tokenTableRequesting', false)
        },
        failCb: () => {
          changeFieldValue('tokenTableSpinning', false)
          changeFieldValue('tokenTableRequesting', false)
        },
      },
    )
  }

  getDataSrcToken = data => {
    const { search } = this.props
    let tmpData = [...data]
    if (search && search.trim().length > 0) {
      tmpData = tmpData.filter((item = {}) => {
        let tmp = false

        tmp =
          item.tokenxName.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.tokenyName.toLowerCase().indexOf(search.toLowerCase()) >= 0

        return tmp
      })
    }

    return tmpData
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { srcToken } = this.props

      this.requestForTableData(srcToken)
    }, pollInterval)

    return true
  }

  getColumns = () => {
    const { npriceSort, dayRateSort, quantitysSort } = this.props

    return [
      {
        title: intl.get('TRADING_PAIR'),
        dataIndex: 'tokenxName',
        key: 'tokenxName',
        width: '16%',
        render: (col, row) => {
          // if (col) {
          //   return (
          //     <div className={styles.pairWrapper}>
          //       <div className={styles.symbol}>{`${row.tokenxSymbol}`}</div>
          //       <div className={styles.contract}>
          //         {row.tokenxContract === 'eosio' ? '' : `@${row.tokenxContract}`}
          //       </div>
          //     </div>
          //   )
          // }

          // if (Object.keys(row).length === 0) return null

          // const tmp = '--'
          // return (
          //   <div className={styles.pairWrapper}>
          //     <div className={styles.symbol}>{`${tmp}`}</div>
          //     <div className={styles.contract}>{`@${tmp}`}</div>
          //   </div>
          // )

          if (col) {
            return (
              <div className={styles.pairWrapper}>
                <div className={styles.pair}>
                  <div className={styles.symbol}>{`${row.tokenxSymbol}`}</div>
                  <div className={styles.contract}>
                    {row.tokenxContract === 'eosio' ? '' : `@${row.tokenxContract}`}
                    {'/'}
                  </div>
                </div>

                <div className={styles.pair}>
                  <div className={styles.symbol}>{`${row.tokenySymbol}`}</div>
                  <div className={styles.contract}>
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
        width: '16%',
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
        title: intl.get('DAY_RATE'),
        dataIndex: 'dayRate',
        key: 'dayRate',
        width: '16%',
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
              return <em className={styles.rateUp}>{`+ ${'0.00'} %`}</em>
            }

            return (
              <em className={dayRateDrection === 'down' ? styles.rateDown : styles.rateUp}>
                {`${dayRateDrection === 'down' ? '-' : '+'} ${col} %`}
              </em>
            )
          }

          return null
        },
      },
      {
        title: intl.get('DAY_HIGHEST'),
        dataIndex: 'hprice',
        key: 'hprice',
        width: '16%',
        render: (col, row) => {
          if (col) {
            const tmp = new BigNumber(getStrWithPrecision(col, row.tokenyPre))
            return `${tmp.toFormat()}`
          }

          if (Object.keys(row).length === 0) return null

          return '--'
        },
      },
      {
        title: intl.get('DAY_LOWEST'),
        dataIndex: 'lprice',
        key: 'lprice',
        width: '16%',
        render: (col, row) => {
          if (col) {
            const tmp = new BigNumber(getStrWithPrecision(col, row.tokenyPre))
            return `${tmp.toFormat()}`
          }

          if (Object.keys(row).length === 0) return null

          return '--'
        },
      },
      {
        title: intl.get('DAY_DEALT'),
        dataIndex: 'quantitys',
        key: 'quantitys',
        width: '16%',
        sortOrder: quantitysSort,
        sorter: (a, b) => {
          let tmpA = new BigNumber(0)
          if (a.quantitys && !Number.isNaN(Number(a.quantitys))) {
            tmpA = new BigNumber(a.quantitys)
          }

          let tmpB = new BigNumber(0)
          if (b.quantitys && !Number.isNaN(Number(b.quantitys))) {
            tmpB = new BigNumber(b.quantitys)
          }

          return tmpA.minus(tmpB).toNumber()
        },
        render: (col, row) => {
          if (col) {
            const tmp = new BigNumber(col)
            return `${tmp.toFormat()}`
          }

          if (Object.keys(row).length === 0) return null

          return '--'
        },
      },
    ]
  }

  render() {
    const {
      tokenTableSpinning,

      srcToken,

      tableData,

      changeSorters,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleText}>{intl.get('MARK')}</div>
          <div className={styles.titleTextTip}>{intl.get('MARK_TIP')}</div>
        </div>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={tokenTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                key={srcToken}
                rowKey={record => `${record.tokenxName}/${record.tokenyName}`}
                bordered={false}
                columns={this.getColumns()}
                dataSource={tableData[srcToken]}
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
                        this._goto('/exchange', tmpUri)
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
