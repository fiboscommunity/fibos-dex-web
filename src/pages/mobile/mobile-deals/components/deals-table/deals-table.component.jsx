import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

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
      title: null,
      key: 'action',
      render: (col, row) => {
        if (Object.keys(row).length > 0) {
          const { tmpTokenXPre, tmpTokenYPre } = this.getMathEles(row)

          const tmpTime = moment(new Date(row.created)).format('YYYY-MM-DD HH:mm:ss')
          let tmpDstToken = new Token()
          let tmpSrcToken = new Token()
          let tmpExchangeRate = null
          let tmpExchangeQuantity = null
          let tmpExchangeAmount = null

          if (row.direction === 'buy') {
            tmpDstToken = new Token(row.tokenpair.tokenx)
            tmpSrcToken = new Token(row.tokenpair.tokeny)

            tmpExchangeRate = getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).div(
                new BigNumber(row.tokenx_quantity).plus(row.fee),
              ),
              tmpTokenYPre,
              true,
            )

            tmpExchangeQuantity = row.tokeny_quantity

            tmpExchangeAmount = getStrWithPrecision(
              new BigNumber(row.tokenx_quantity).plus(row.fee),
              tmpTokenXPre,
            )
          }

          if (row.direction === 'sell') {
            tmpDstToken = new Token(row.tokenpair.tokeny)
            tmpSrcToken = new Token(row.tokenpair.tokenx)

            tmpExchangeRate = getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).plus(row.fee).div(row.tokenx_quantity),
              tmpTokenYPre,
              true,
            )

            tmpExchangeQuantity = getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).plus(row.fee),
              tmpTokenYPre,
            )

            tmpExchangeAmount = row.tokenx_quantity
          }

          return (
            <div className={styles.cardWrapper}>
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
                    {tmpDstToken.tokenContract === 'eosio' ? '' : `@${tmpDstToken.tokenContract}/`}
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
                showHeader={false}
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

export default DealsTable
