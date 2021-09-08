import React, { PureComponent } from 'react'
import classnames from 'classnames'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import Pagination from 'antd/lib/pagination'
import 'antd/lib/pagination/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'

import { Token } from 'Datasets'
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

          if (Object.keys(row).length > 0 && row.account && row.account.id === name) {
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
            let tmpStatusStr = null

            switch (row.status) {
              case 'complete':
                tmpStatusStr = intl.get('COMPLETE')
                break

              case 'cancel':
                tmpStatusStr = intl.get('CANCELLED')
                break

              default:
                break
            }

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
                  <Button className={styles.statusBtn} loading={requestingContract}>
                    {tmpStatusStr}
                    <Icon type="right" />
                  </Button>
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

  getExpandedRowRender = record => {
    if (record.deal.length === 0) {
      return <div className={styles.noDeals}>{intl.get('NO_DEALS')}</div>
    }

    const columns = [
      {
        title: null,
        key: 'action',
        render: (col, row) => {
          if (Object.keys(row).length > 0) {
            const { tmpTokenYPre } = this.getMathEles(row)

            const tmpTime = moment(new Date(row.created)).format('YYYY-MM-DD HH:mm:ss')
            const tmpDstToken = new Token(row.tokenpair.tokenx)
            const tmpSrcToken = new Token(row.tokenpair.tokeny)
            const tmpExchangeRate = getStrWithPrecision(
              new BigNumber(row.price),
              tmpTokenYPre,
              true,
            )
            const tmpExchangeQuantity = row.tokenx_quantity
            const tmpExchangeAmount = row.tokeny_quantity

            return (
              <div className={styles.innerCardWrapper}>
                <div className={styles.titleRow}>
                  <div className={styles.time}>{tmpTime}</div>
                </div>
                <div className={styles.pairWrapper}>
                  <div className={styles.pair}>
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
                  </div>
                </div>
                <div className={styles.exchangeRateRow}>
                  <div className={styles.exchangeRate}>{`${intl.get('CHANGE_RATIO')}`}</div>
                  <div className={styles.infovalue}>{`${1} : ${tmpExchangeRate}`}</div>
                </div>
                <div className={styles.infosWrapper}>
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

    return (
      <Table
        className={styles.innerTable}
        showHeader={false}
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
                showHeader={false}
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
