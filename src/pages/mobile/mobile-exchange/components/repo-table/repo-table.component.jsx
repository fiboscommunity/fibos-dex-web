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

import styles from './repo-table.module.css'

class RepoTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { pairId } = this.props

    if (pairId) {
      this.requestForTableDataOfRepo()
      this.startPoll()
    }
  }

  componentDidUpdate(prevProps) {
    const { pairId, needToReverse, recordPanelTab, changeFieldValue } = this.props

    if (
      prevProps.pairId !== pairId ||
      prevProps.needToReverse !== needToReverse ||
      (prevProps.recordPanelTab !== recordPanelTab && recordPanelTab === 'repo')
    ) {
      changeFieldValue('spinningRepo', true)

      if (pairId) {
        this.requestForTableDataOfRepo()
      }
    }

    const { requestingRepo } = this.props

    if (
      (!requestingRepo && requestingRepo !== prevProps.requestingRepo) ||
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

  getRepoColumns = (src, dst) => [
    {
      title: intl.get('TIME'),
      dataIndex: 'created',
      key: 'created',
      render: (col /* , row, index */) => {
        if (col) {
          return moment(new Date(col)).format('MM-DD HH:mm:ss')
        }

        return null
      },
    },
    {
      title: `${intl.get('PRICE')}${src.symbol ? `(${src.symbol})` : ''}`,
      dataIndex: 'price',
      key: 'price',
      render: (col, row /* , index */) => {
        const { srcToken, needToReverse } = this.props
        const srcTokenPre = srcToken.pre

        if (col) {
          if (needToReverse) {
            if (row.direction === 'buy') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).plus(row.fee).div(row.tokeny_quantity),
                srcTokenPre,
                true,
              )}`
            }

            if (row.direction === 'sell') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokenx_quantity).div(
                  new BigNumber(row.tokeny_quantity).plus(row.fee),
                ),
                srcTokenPre,
                true,
              )}`
            }
          }

          if (row.direction === 'buy') {
            return `${getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).div(
                new BigNumber(row.tokenx_quantity).plus(row.fee),
              ),
              srcTokenPre,
              true,
            )}`
          }

          if (row.direction === 'sell') {
            return `${getStrWithPrecision(
              new BigNumber(row.tokeny_quantity).plus(row.fee).div(row.tokenx_quantity),
              srcTokenPre,
              true,
            )}`
          }
        }

        return null
      },
    },
    {
      title: `${intl.get('EXCHANGE_AMOUNT')}${dst.symbol ? `(${dst.symbol})` : ''}`,
      dataIndex: 'tokenx_quantity',
      key: 'tokenx_quantity',
      render: (col, row /* , index */) => {
        const { dstToken, needToReverse } = this.props
        const dstTokenPre = dstToken.pre

        if (col) {
          if (needToReverse) {
            if (row.direction === 'buy') {
              return row.tokeny_quantity
            }

            if (row.direction === 'sell') {
              return `${getStrWithPrecision(
                new BigNumber(row.tokeny_quantity).plus(row.fee),
                dstTokenPre,
              )}`
            }
          }

          if (row.direction === 'buy') {
            return `${getStrWithPrecision(new BigNumber(col).plus(row.fee), dstTokenPre)}`
          }

          if (row.direction === 'sell') {
            return col
          }
        }

        return null
      },
    },
  ]

  handleChangeRepoPage = page => {
    const { changeFieldValue } = this.props

    changeFieldValue('repoDataPage', page)
    changeFieldValue('spinningRepo', true)
    changeFieldValue('requestingRepo', true)

    this.requestForTableDataOfRepo({
      page,
    })
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForTableDataOfRepo()
    }, pollInterval)

    return true
  }

  requestForTableDataTotalOfRepo(tableConfig, getTableFuc) {
    const { changeFieldValue, requestForTableDataTotalOfRepo } = this.props

    requestForTableDataTotalOfRepo(
      { ...tableConfig },
      {
        successCb: () => {
          if (getTableFuc) {
            getTableFuc()
          }
        },
        failCb: () => {
          changeFieldValue('spinningRepo', false)
          changeFieldValue('requestingRepo', false)
        },
      },
    )
  }

  requestForTableDataOfRepo(tableConfig) {
    const {
      pairId,
      repoDataPage,
      repoDataPageSize,
      changeFieldValue,
      requestForTableDataOfRepo,
    } = this.props

    const config = {
      pairId,
      page: repoDataPage,
      pagesize: repoDataPageSize,
      ...tableConfig,
    }

    changeFieldValue('requestingRepo', true)
    this.requestForTableDataTotalOfRepo({ ...config }, () => {
      requestForTableDataOfRepo(
        { ...config },
        {
          successCb: () => {
            changeFieldValue('spinningRepo', false)
            changeFieldValue('requestingRepo', false)
          },
          failCb: () => {
            changeFieldValue('spinningRepo', false)
            changeFieldValue('requestingRepo', false)
          },
        },
      )
    })
  }

  render() {
    const {
      srcToken,
      dstToken,

      spinningRepo,
      repoData,
      repoDataTotal,
      repoDataPage,
      repoDataPageSize,
    } = this.props

    return (
      <SpinWrapper spinning={spinningRepo}>
        <div className={styles.tableWrapper}>
          <LocaleProvider locale={zhCN}>
            <Table
              className={styles.table}
              columns={this.getRepoColumns(srcToken, dstToken)}
              rowKey={record => `${record.id}`}
              dataSource={repoData}
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
              current={repoDataPage}
              hideOnSinglePage
              pageSize={repoDataPageSize}
              showLessItems={false}
              total={repoDataTotal}
              onChange={this.handleChangeRepoPage}
              showQuickJumper={false}
              showTotal={total => {
                const pageNumber = Math.ceil(total / repoDataPageSize)

                return `${intl.get('TOTAL')} ${pageNumber} ${intl.get('PAGE')}`
              }}
            />
          </LocaleProvider>
        </div>
      </SpinWrapper>
    )
  }
}

export default RepoTable
