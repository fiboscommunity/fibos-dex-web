import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'

import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import TabPanel from './components/tab-panel'

import Card from '../card'
import styles from './pairs.module.css'

const { Option } = Select

class Pairs extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}

    this.columns = [
      {
        title: intl.get('TRADING_PAIR'),
        dataIndex: 'tokenxName',
        key: 'tokenxName',
        width: '45%',
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
                  <div className={styles.symbol}>
                    {`${row.tokenxSymbol}`}
                    {row.tokenxContract === 'eosio' || row.tokenxContract === 'testfibos111'
                      ? ''
                      : `@${row.tokenxContract}`}
                  </div>
                </div>

                <div className={styles.pair}>
                  <div className={styles.symbol}>
                    {'/'}
                    {`${row.tokenySymbol}`}
                    {row.tokenyContract === 'eosio' || row.tokenxContract === 'testfibos111'
                      ? ''
                      : `@${row.tokenyContract}`}
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
        dataIndex: 'uniswapPrice',
        key: 'uniswapPrice',
        sorter: (a, b) => {
          let tmpA = new BigNumber(0)
          if (a.uniswapPrice && !Number.isNaN(Number(a.uniswapPrice))) {
            tmpA = new BigNumber(a.uniswapPrice)
          }

          let tmpB = new BigNumber(0)
          if (b.uniswapPrice && !Number.isNaN(Number(b.uniswapPrice))) {
            tmpB = new BigNumber(b.uniswapPrice)
          }

          return tmpB.minus(tmpA).toNumber()
        },
        width: '30%',
        render: (col, row) => {
          if (col) {
            return `${col}${row.newestToCNY ? ` ≈ ¥${row.newestToCNY}` : ''}`
          }

          if (Object.keys(row).length === 0) return null

          return '--'
        },
      },
      {
        title: intl.get('DAY_RATE2'),
        dataIndex: 'dayRate',
        key: 'dayRate',
        width: '35%',
        sorter: (a, b) => {
          let tmpA = new BigNumber(0)
          if (a.dayChangeNumber && !Number.isNaN(Number(a.dayChangeNumber))) {
            tmpA = new BigNumber(a.dayChangeNumber)
          }

          let tmpB = new BigNumber(0)
          if (b.dayChangeNumber && !Number.isNaN(Number(b.dayChangeNumber))) {
            tmpB = new BigNumber(b.dayChangeNumber)
          }

          return tmpB.minus(tmpA).toNumber()
        },
        render: (col, row) => {
          if (col && row) {
            const { dayRateDrection } = row

            return (
              <em className={dayRateDrection === 'down' ? styles.rateDown : styles.rateUp}>
                {`${dayRateDrection === 'down' ? '-' : '+'} ${col} %`}
              </em>
            )
          }

          if (Object.keys(row).length === 0) return null

          return <em className={styles.rateUp}>{`+ ${0} %`}</em>
        },
      },
    ]
  }

  // onSrcTokenChange = event => {
  //   const { changeFieldValue, requestForTableDataOfPairs, resetPair, initPair } = this.props

  //   const tmpSrcToken = srcTokensMap[event.key]

  //   changeFieldValue('spinningPairs', true)
  //   changeFieldValue('requestingPairs', true)
  //   changeFieldValue('selectedSrcToken', tmpSrcToken.tokenName)

  //   requestForTableDataOfPairs(
  //     { srcTokenName: tmpSrcToken.tokenName },
  //     {
  //       successCb: array => {
  //         if (!array || array.length <= 0) {
  //           message.error(intl.get('NO_AVAILABLE_PAIRS'))

  //           resetPair()
  //           initPair()
  //         }

  //         changeFieldValue('spinningPairs', false)
  //         changeFieldValue('requestingPairs', false)
  //       },
  //       failCb: () => {
  //         changeFieldValue('spinningPairs', false)
  //         changeFieldValue('requestingPairs', false)
  //       },
  //     },
  //   )
  // }

  componentDidMount() {
    const { requestForSearchingPairs } = this.props

    requestForSearchingPairs({ search: '' })
  }

  searchForPairs = e => {
    const { resetPairsDropList, requestForSearchingPairs } = this.props

    if (Object.prototype.toString.call(e) === '[object String]') {
      requestForSearchingPairs({ search: e })
    } else {
      resetPairsDropList()
    }
  }

  handleOptionClick = data => {
    const { dstToken, srcToken } = data
    const { changeFieldValue, history, requestForSearchingPairs } = this.props

    changeFieldValue('dstToken', dstToken)
    changeFieldValue('srcToken', srcToken)
    requestForSearchingPairs({ search: '' })

    const tmpUri = queryString.stringify({
      x: dstToken.tokenName,
      y: srcToken.tokenName,
    })

    history.push({
      pathname: '/exchange',
      search: tmpUri,
    })
  }

  getOptions = data => {
    if (Object.prototype.toString.call(data) === '[object Array]' && data.length > 0) {
      return data.map((item, index) => {
        const { dstToken, srcToken } = item

        return (
          <Option key={`${dstToken.tokenName}/${srcToken.tokenName}`} value={index} data={item}>
            <div className={styles.optionWrapper}>
              <div className={styles.dstRow}>{`${dstToken.tokenName}`}</div>
              <div className={styles.srcRow}>{`${srcToken.tokenName}`}</div>
            </div>
          </Option>
        )
      })
    }

    return []
  }

  render() {
    const {
      ironmanData,

      requestDataOfCurrentpair,
      spinningPairs,
      selectedSrcToken,
      pairs,
      pairsDropList,

      getTokens,
      changeFieldValue,
    } = this.props

    const addon = (
      <div className={styles.formWrapper}>
        <div className={styles.searchWrapper} id={styles.searchWrapper}>
          <Select
            loading
            allowClear
            showSearch
            className={styles.search}
            dropdownClassName={styles.dropdownClassName}
            value={undefined}
            placeholder={intl.get('SEARCH_TOKEN_PLACEHOLDER')}
            onSearch={this.searchForPairs}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            notFoundContent={intl.get('RACORD_NO_SEARCH_DATA')}
            getPopupContainer={() => document.getElementById(styles.searchWrapper)}
            onChange={(value, option) => {
              const {
                props: { data },
              } = option

              if (data && Object.keys(data).length > 0) {
                this.handleOptionClick(data)
              }
            }}>
            {this.getOptions(pairsDropList)}
          </Select>
        </div>
        <div className={styles.menuWrapper}>
          {/* <Menu
            className={styles.menu}
            mode="horizontal"
            defaultSelectedKeys={[]}
            selectedKeys={[selectedSrcToken]}
            onSelect={this.onSrcTokenChange}>
            {Object.keys(srcTokensMap).map(item => (
              <Menu.Item key={item}>
                <span className={styles.menutext}>{intl.get(item)}</span>
              </Menu.Item>
            ))}
          </Menu> */}
        </div>
      </div>
    )

    const title = (
      <div className={styles.titleWrapper}>
        <div className={styles.titleText}>{intl.get('MARKET')}</div>
        {ironmanData && (
          <div className={styles.addPairWrapper}>
            <Button
              className={styles.addPairBtn}
              onClick={() => {
                changeFieldValue('addPairModalShow', true)
              }}>
              {intl.get('ADD_PAIRS')}
            </Button>
          </div>
        )}
      </div>
    )

    return (
      <Card className={styles.wrapper} title={title} addon={addon} height={90}>
        <div className={styles.content}>
          <TabPanel
            key="bancor"
            selectedSrcToken={selectedSrcToken}
            columns={this.columns}
            tableData={pairs}
            tableRows={8}
            onChange={e => {
              changeFieldValue('search', e.target.value)
            }}
            requesting={spinningPairs}
            requestDataOfCurrentpair={requestDataOfCurrentpair}
            getTokens={getTokens}
          />
        </div>
      </Card>
    )
  }
}

export default withRouter(Pairs)
