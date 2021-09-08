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

import noData from 'Assets/commons/noData.png'
import styles from './search-table.module.css'

class TokenTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
    // this.searchTimeout = null
  }

  // componentDidUpdate(prevProps) {
  //   const { isSearching, searchValue } = this.props

  //   if (
  //     isSearching &&
  //     (isSearching !== prevProps.isSearching || searchValue !== prevProps.searchValue)
  //   ) {
  //     this.requestForSearchData(searchValue)
  //   }
  // }

  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  // requestForSearchData = search => {
  //   if (!search) return

  //   const { changeFieldValue, requestForSearchData } = this.props

  //   changeFieldValue('searchTableSpinning', true)
  //   changeFieldValue('searchTableRequesting', true)

  //   const reqFuc = () => {
  //     requestForSearchData(
  //       { search },
  //       {
  //         successCb: () => {
  //           changeFieldValue('searchTableSpinning', false)
  //           changeFieldValue('searchTableRequesting', false)
  //         },
  //         failCb: () => {
  //           changeFieldValue('searchTableSpinning', false)
  //           changeFieldValue('searchTableRequesting', false)
  //         },
  //       },
  //     )
  //   }

  //   if (this.searchTimeout) {
  //     clearTimeout(this.searchTimeout)
  //   }

  //   this.searchTimeout = setTimeout(() => {
  //     reqFuc()
  //   }, requestInterval)
  // }

  getColumns = () => [
    {
      title: intl.get('TRADING_PAIR'),
      dataIndex: 'tokenxName',
      key: 'tokenxName',
      width: '16%',
      render: (col, row) => {
        if (col) {
          return (
            <div className={styles.pairWrapper}>
              <div className={styles.pair}>
                <div className={classnames(styles.symbol, styles.srctoken)}>
                  {row.tokenxContract === 'eosio' ? `${row.tokenxSymbol}/` : `${row.tokenxSymbol}`}
                </div>
                <div className={styles.contract}>
                  {row.tokenxContract === 'eosio' ? '' : `@${row.tokenxContract}/`}
                </div>
              </div>

              <div className={styles.pair}>
                <div className={classnames(styles.symbol, styles.dsttoken)}>
                  {`${row.tokenySymbol}`}
                </div>
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
      title: intl.get('DAY_RATE'),
      dataIndex: 'dayRate',
      key: 'dayRate',
      width: '16%',
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
              <div className={styles.rateSymbol}>{`${dayRateDrection === 'down' ? '-' : '+'}`}</div>
              <div className={styles.rateNumber}>{`${col} %`}</div>
            </div>
          )
        }

        return null
      },
    },
  ]

  render() {
    const {
      match,

      searchTableSpinning,
      searchData,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={searchTableSpinning}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                rowKey={record => `${record.tokenxName}/${record.tokenyName}`}
                bordered
                columns={this.getColumns()}
                dataSource={searchData}
                pagination={false}
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
