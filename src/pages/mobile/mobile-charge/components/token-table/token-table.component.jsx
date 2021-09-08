import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import classnames from 'classnames'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import LocaleProvider from 'antd/lib/locale-provider'
import 'antd/lib/locale-provider/style/css'
import zhCN from 'antd/lib/locale-provider/zh_CN'

import { SpinWrapper } from 'Components'
import { requestInterval } from 'Config'

import styles from './token-table.module.css'

class TokenTable extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.searchTimeout = null
  }

  componentDidMount() {
    this.requestForTokensForSelect()
  }

  // componentDidUpdate(prevProps) {
  //   const { searchValue } = this.props

  //   if (searchValue !== prevProps.searchValue && searchValue) {
  //     this.requestForTokensForSelect(searchValue)
  //   }
  // }

  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  requestForTokensForSelect = searchValue => {
    const { changeFieldValue, requestForTokensForSelect } = this.props

    changeFieldValue('requestingTokensForSelect', true)

    const reqFuc = () => {
      requestForTokensForSelect(
        {
          search: searchValue || '',
        },
        {
          successCb: () => {
            changeFieldValue('requestingTokensForSelect', false)
            clearTimeout(this.searchTimeout)
          },
          failCb: () => {
            changeFieldValue('requestingTokensForSelect', false)
            clearTimeout(this.searchTimeout)
          },
        },
      )
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }

    this.searchTimeout = setTimeout(() => {
      reqFuc()
    }, requestInterval)
  }

  checkTokenVal = (target, toCompare) => {
    const unavailable =
      (target.id && toCompare.id === target.id) ||
      (target.isSmart && !toCompare.isSmart && toCompare.id === target.cwToken) ||
      (target.isSmart && toCompare.isSmart && toCompare.cwToken === target.cwToken) ||
      (!target.isSmart && toCompare.isSmart && toCompare.cwToken === target.id)

    return unavailable
  }

  getColumns = () => {
    const {
      addPairDstToken,
      addPairSrcToken,
      selectingToken,

      changeFieldValue,
      resetSelectToken,
    } = this.props

    return [
      {
        dataIndex: 'tokenObj',
        key: 'tokenObj[dslName]',
        width: '16%',
        render: col => {
          if (col) {
            const disabled = this.checkTokenVal(
              selectingToken === 'dst' ? addPairSrcToken : addPairDstToken,
              col,
            )

            return (
              <div
                className={
                  disabled
                    ? classnames(styles.pairWrapper, styles.disabledPair)
                    : styles.pairWrapper
                }
                onClick={() => {
                  if (disabled) return

                  if (selectingToken === 'dst') {
                    changeFieldValue('addPairDstToken', col)
                  }

                  if (selectingToken === 'src') {
                    changeFieldValue('addPairSrcToken', col)
                  }

                  resetSelectToken()
                }}>
                <div className={styles.pair}>
                  <div className={classnames(styles.symbol, styles.srctoken)}>
                    {`${col.tokenSymbol}`}
                  </div>
                  <div className={styles.contract}>
                    {col.tokenContract === 'eosio' ? '' : `@${col.tokenContract}`}
                  </div>
                  {disabled && (
                    <div className={styles.disabledText}>{intl.get('CAN_NOT_SELECT_TOKEN')}</div>
                  )}
                </div>
              </div>
            )
          }

          return null
        },
      },
    ]
  }

  render() {
    const { requestingTokensForSelect, tokensForSelect } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.tableWrapper}>
          <SpinWrapper spinning={requestingTokensForSelect}>
            <LocaleProvider locale={zhCN}>
              <Table
                className={styles.table}
                showHeader={false}
                rowKey={record => record.tokenObj.dslName}
                bordered
                columns={this.getColumns()}
                dataSource={tokensForSelect}
                pagination={false}
                locale={{
                  emptyText: (
                    <div className={styles.noDataWrapper}>
                      <div className={styles.noDataText}>{intl.get('NO_SEARCH_DATA')}</div>
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
