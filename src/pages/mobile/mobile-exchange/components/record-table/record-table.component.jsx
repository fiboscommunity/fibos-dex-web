import React, { PureComponent } from 'react'
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
import { getStrWithPrecision } from 'Utils'
import { pollInterval } from 'Config'

import moment from 'moment'

import noData from 'Assets/commons/noData.png'

import styles from './record-table.module.css'

class RecordTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { pairId } = this.props

    if (pairId) {
      this.requestForTableDataOfRecord()
      this.startPoll()
    }
  }

  componentDidUpdate(prevProps) {
    const { pairId, needToReverse, recordPanelTab, changeFieldValue } = this.props

    if (
      prevProps.pairId !== pairId ||
      prevProps.needToReverse !== needToReverse ||
      (prevProps.recordPanelTab !== recordPanelTab && recordPanelTab === 'record')
    ) {
      changeFieldValue('spinningRecord', true)

      if (pairId) {
        this.requestForTableDataOfRecord()
      }
    }

    const { requestingRecord } = this.props

    if (
      (!requestingRecord && requestingRecord !== prevProps.requestingRecord) ||
      recordPanelTab !== prevProps.recordPanelTab
    ) {
      clearTimeout(this.timeout)

      this.startPoll()
    }

    return null
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  getRecordColumns = (src, dst) => {
    const { tradingType, needToReverse } = this.props

    if (tradingType === 'bancor') {
      return [
        {
          title: intl.get('TIME'),
          dataIndex: 'created',
          key: 'created',
          render: col => {
            if (col) {
              return moment(new Date(col)).format('MM-DD HH:mm:ss')
            }

            return null
          },
        },
        {
          title: `${intl.get('EXCHANGE_PRICE')}${src.symbol ? `(${src.symbol})` : ''}`,
          dataIndex: 'price',
          key: 'price',
          render: (col, row) => {
            let tmpResult = ''

            if (col) {
              if (
                new BigNumber(row.tokenx_quantity).eq(0) ||
                new BigNumber(row.tokeny_quantity).eq(0)
              ) {
                tmpResult = '--'
              }

              const srcTokenPre = src.pre

              if (needToReverse) {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokenx_quantity).div(row.tokeny_quantity),
                  srcTokenPre,
                  true,
                )}`
              } else {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokeny_quantity).div(row.tokenx_quantity),
                  srcTokenPre,
                  true,
                )}`
              }
            }

            let tmpDir = row.direction

            if (needToReverse) {
              if (row.direction === 'buy') {
                tmpDir = 'sell'
              }

              if (row.direction === 'sell') {
                tmpDir = 'buy'
              }
            }

            return (
              <div className={tmpDir && tmpDir === 'buy' ? styles.buy : styles.sell}>
                {tmpResult}
              </div>
            )
          },
        },
        {
          title: `${intl.get('EXCHANGE_AMOUNT')}${dst.symbol ? `(${dst.symbol})` : ''}`,
          dataIndex: 'tokeny_quantity',
          key: 'tokeny_quantity',
          render: (col, row) => {
            let tmpResult = ''

            if (needToReverse && row.tokeny_quantity) {
              tmpResult = `${row.tokeny_quantity}`
            } else if (row.tokenx_quantity) {
              tmpResult = `${row.tokenx_quantity}`
            }

            let tmpDir = row.direction

            if (needToReverse) {
              if (row.direction === 'buy') {
                tmpDir = 'sell'
              }

              if (row.direction === 'sell') {
                tmpDir = 'buy'
              }
            }

            return (
              <div className={tmpDir && tmpDir === 'buy' ? styles.buy : styles.sell}>
                {tmpResult}
              </div>
            )
          },
        },
      ]
    }

    return [
      {
        title: intl.get('TIME'),
        dataIndex: 'created',
        key: 'created',
        render: col => {
          if (col) {
            return moment(new Date(col)).format('MM-DD HH:mm:ss')
          }

          return null
        },
      },
      {
        title: `${intl.get('EXCHANGE_PRICE')}${src.symbol ? `(${src.symbol})` : ''}`,
        dataIndex: 'price',
        key: 'price',
        render: (col, row) => {
          const srcTokenPre = src.pre

          let tmpResult = ''

          if (col) {
            if (
              new BigNumber(row.tokenx_quantity).eq(0) ||
              new BigNumber(row.tokeny_quantity).eq(0)
            ) {
              tmpResult = '--'
            }

            if (needToReverse) {
              if (row.direction === 'buy') {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokenx_quantity).plus(row.fee).div(row.tokeny_quantity),
                  srcTokenPre,
                  true,
                )}`
              }

              if (row.direction === 'sell') {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokenx_quantity).div(
                    new BigNumber(row.tokeny_quantity).plus(row.fee),
                  ),
                  srcTokenPre,
                  true,
                )}`
              }
            } else {
              if (row.direction === 'buy') {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokeny_quantity).div(
                    new BigNumber(row.tokenx_quantity).plus(row.fee),
                  ),
                  srcTokenPre,
                  true,
                )}`
              }

              if (row.direction === 'sell') {
                tmpResult = `${getStrWithPrecision(
                  new BigNumber(row.tokeny_quantity).plus(row.fee).div(row.tokenx_quantity),
                  srcTokenPre,
                  true,
                )}`
              }
            }
          }

          let tmpDir = row.direction

          if (needToReverse) {
            if (row.direction === 'buy') {
              tmpDir = 'sell'
            }

            if (row.direction === 'sell') {
              tmpDir = 'buy'
            }
          }

          return (
            <div className={tmpDir && tmpDir === 'buy' ? styles.buy : styles.sell}>{tmpResult}</div>
          )
        },
      },
      {
        title: `${intl.get('EXCHANGE_AMOUNT')}${dst.symbol ? `(${dst.symbol})` : ''}`,
        dataIndex: 'tokenx_quantity',
        key: 'tokenx_quantity',
        render: (col, row) => {
          const { dstToken } = this.props
          const dstTokenPre = dstToken.pre

          let tmpResult = ''

          if (needToReverse) {
            if (row.direction === 'buy') {
              tmpResult = row.tokeny_quantity
            }

            if (row.direction === 'sell') {
              tmpResult = `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).plus(row.fee),
                dstTokenPre,
              )}`
            }
          } else {
            if (row.direction === 'buy') {
              tmpResult = `${getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).plus(row.fee),
                dstTokenPre,
              )}`
            }

            if (row.direction === 'sell') {
              tmpResult = row.tokenx_quantity
            }
          }

          let tmpDir = row.direction

          if (needToReverse) {
            if (row.direction === 'buy') {
              tmpDir = 'sell'
            }

            if (row.direction === 'sell') {
              tmpDir = 'buy'
            }
          }

          return <div className={tmpDir === 'buy' ? styles.buy : styles.sell}>{tmpResult}</div>
        },
      },
    ]
  }

  handleChangeRecordPage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('recordDataPage', page)
    changeFieldValue('spinningRecord', true)
    changeFieldValue('requestingRecord', true)

    this.requestForTableDataOfRecord({
      page,
    })
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForTableDataOfRecord()
    }, pollInterval)

    return true
  }

  requestForTableDataTotalOfRecord(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTableDataTotalOfRecord } = this.props

    requestForTableDataTotalOfRecord(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('spinningRecord', false)
          changeFieldValue('requestingRecord', false)
        },
      },
    )
  }

  requestForTableDataOfRecord(tableConfig) {
    const {
      pairId,
      recordDataPage,
      recordDataPageSize,
      changeFieldValue,
      requestForTableDataOfRecord,
    } = this.props

    const config = {
      pairId,
      page: recordDataPage,
      pagesize: recordDataPageSize,
      ...tableConfig,
    }

    changeFieldValue('requestingRecord', true)
    this.requestForTableDataTotalOfRecord({ ...config }, () => {
      requestForTableDataOfRecord(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('spinningRecord', false)
            changeFieldValue('requestingRecord', false)
          },
          failCb: () => {
            changeFieldValue('spinningRecord', false)
            changeFieldValue('requestingRecord', false)
          },
        },
      )
    })
  }

  render() {
    const {
      srcToken,
      dstToken,

      spinningRecord,
      recordData,
      recordDataTotal,
      recordDataPage,
      recordDataPageSize,
    } = this.props

    return (
      <SpinWrapper spinning={spinningRecord}>
        <div className={styles.tableWrapper}>
          <LocaleProvider locale={zhCN}>
            <Table
              className={styles.table}
              columns={this.getRecordColumns(srcToken, dstToken)}
              rowKey={record => `${record.id}`}
              dataSource={recordData}
              pagination={false}
              locale={{
                emptyText: (
                  <div className={styles.noDataWrapper}>
                    <div className={styles.noDataImgWrapper}>
                      <img className={styles.noDataImg} src={noData} alt="" />
                    </div>
                    <div className={styles.noDataText}>{intl.get('RACORD_NO_DATA')}</div>
                  </div>
                ),
              }}
            />
          </LocaleProvider>
          <LocaleProvider locale={zhCN}>
            <Pagination
              className={styles.pagination}
              current={recordDataPage}
              hideOnSinglePage
              pageSize={recordDataPageSize}
              showLessItems={false}
              total={recordDataTotal}
              onChange={this.handleChangeRecordPage}
              showQuickJumper={false}
              showTotal={total => {
                const pageNumber = Math.ceil(total / recordDataPageSize)

                return `${intl.get('TOTAL')} ${pageNumber} ${intl.get('PAGE')}`
              }}
            />
          </LocaleProvider>
        </div>
      </SpinWrapper>
    )
  }
}

export default RecordTable
