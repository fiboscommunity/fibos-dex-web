import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'
import Drawer from 'antd/lib/drawer'
import 'antd/lib/drawer/style/css'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'
import notification from 'antd/lib/notification'
import 'antd/lib/notification/style/css'

import { withBack } from 'Commons'
import { tradeTypeMap, pollInterval, mobileTitleNavHeight } from 'Config'
import { getStrWithPrecision } from 'Utils'

import CandlestickChart from './components/candlestick-chart'
import Handicap from './components/handicap'
import TradePanel from './components/trade-panel'
import Rank from './components/rank'
import Infos from './components/infos'
import DelegateTable from './components/delegate-table'
import RecordTable from './components/record-table'
import RepoTable from './components/repo-table'
import ProductionDetail from './components/production-detail'

import styles from './mobile-exchange.module.css'

class MobileExchange extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { changeFieldValue } = this.props

    window.scrollTo(0, 0)

    changeFieldValue('spinningPairs', true)
    this.urlSearchHandler()

    const { srcToken, getTokenDetails } = this.props
    getTokenDetails(srcToken, {
      successCb: () => {},
      failCb: () => {},
    })
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search },

      srcToken,
      dstToken,
      needToReverse,
      pairId,

      requestingContract,

      resetPanelFormData,
      resetRecord,
    } = this.props

    if (
      dstToken.tokenName &&
      srcToken.tokenName &&
      (prevProps.dstToken.tokenName !== dstToken.tokenName ||
        prevProps.srcToken.tokenName !== srcToken.tokenName ||
        prevProps.needToReverse !== needToReverse)
    ) {
      clearTimeout(this.timeout)

      this.getSwapRank(srcToken, dstToken)
      this.getHandicapData(srcToken, dstToken)
      this.requestForDataOfPair(dstToken.tokenName, srcToken.tokenName)
      resetPanelFormData()
      resetRecord()
      this.requestForProductionData()
    }

    if (pairId !== prevProps.pairId) {
      this.checkRepo()
    }

    if (search && prevProps.location.search !== search) {
      clearTimeout(this.timeout)

      this.urlSearchHandler()
    }
    const { requestingPairs } = this.props

    if (requestingPairs !== prevProps.requestingPairs) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    if (requestingContract !== prevProps.requestingContract) {
      if (requestingContract) {
        this.openNotificationOfRequestingContract()
      } else {
        this.closeNotificationOfRequestingContract()
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)

    const { destroy } = this.props
    destroy()
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { srcToken, dstToken, requestForKDataOfPair, changeFieldValue } = this.props

      this.getHandicapData(srcToken, dstToken)
      this.requestForTableDataOfPairs(dstToken.tokenName, srcToken.tokenName)
      changeFieldValue('requestingKDataOfPair', true)
      requestForKDataOfPair(
        { tokenx: dstToken.tokenName, tokeny: srcToken.tokenName },
        {
          successCb: (kdata) => {
            const { res, req } = kdata

            changeFieldValue('requestingKDataOfPair', false)
            if (dstToken.tokenName === req.tokenx && srcToken.tokenName === req.tokeny) {
              changeFieldValue('oneDayKdata', res)
            }
          },
          failCb: () => {
            changeFieldValue('requestingKDataOfPair', false)
          },
        },
      )
    }, pollInterval)

    return true
  }

  getSwapRank = (srcToken, dstToken) => {
    const { getSwapRank, ironmanData, changeFieldValue } = this.props

    let tmpName = ''

    if (ironmanData && ironmanData.account && ironmanData.account.name) {
      tmpName = ironmanData.account.name
    }

    changeFieldValue('requestingRank', true)
    getSwapRank(
      {
        tokenx: dstToken.tokenName,
        tokeny: srcToken.tokenName,
        name: tmpName,
      },
      {
        successCb: () => {
          changeFieldValue('spinningRank', false)
          changeFieldValue('requestingRank', false)
        },
        failCb: () => {
          changeFieldValue('spinningRank', false)
          changeFieldValue('requestingRank', false)
        },
      },
    )
  }

  getHandicapData = (srcToken, dstToken) => {
    const { getHandicapData, changeFieldValue } = this.props

    changeFieldValue('requestingHandicap', true)
    getHandicapData(
      {
        tokenx: dstToken.tokenName,
        tokeny: srcToken.tokenName,
        limit: 10,
      },
      {
        successCb: () => {
          changeFieldValue('spinningHandicap', false)
          changeFieldValue('requestingHandicap', false)
        },
        failCb: () => {
          changeFieldValue('spinningHandicap', false)
          changeFieldValue('requestingHandicap', false)
        },
      },
    )
  }

  requestForDataOfPair = (x, y, toInit = false) => {
    const { changeFieldValue, requestForDataOfPair, requestForKDataOfPair } = this.props

    changeFieldValue('requestDataOfCurrentpair', true)

    requestForDataOfPair(
      { dstTokenName: x, srcTokenName: y },
      {
        successCb: (data) => {
          if (toInit) {
            this.getTokens(data, true)

            const { tokenxName, tokenyName } = data
            changeFieldValue('spinningKDataOfPair', true)
            changeFieldValue('requestingKDataOfPair', true)
            requestForKDataOfPair(
              { tokenx: tokenxName, tokeny: tokenyName },
              {
                successCb: (kdata) => {
                  const { res, req } = kdata
                  const { dstToken, srcToken } = this.props

                  changeFieldValue('spinningKDataOfPair', false)
                  changeFieldValue('requestingKDataOfPair', false)
                  if (dstToken.tokenName === req.tokenx && srcToken.tokenName === req.tokeny) {
                    changeFieldValue('oneDayKdata', res)
                  }
                },
                failCb: () => {
                  changeFieldValue('spinningKDataOfPair', false)
                  changeFieldValue('requestingKDataOfPair', false)
                },
              },
            )
          }

          changeFieldValue('requestDataOfCurrentpair', false)
        },
        failCb: () => {
          changeFieldValue('requestDataOfCurrentpair', false)
        },
      },
    )
  }

  requestForTableDataOfPairs = () => {
    const { requestForTableDataOfPairs, changeFieldValue } = this.props

    // const tmpPairsSrctoken = srcTokensMap[y] ? y : defaultSrcTokens
    // if (selectedSrcToken !== tmpPairsSrctoken) {
    //   changeFieldValue('selectedSrcToken', tmpPairsSrctoken)
    // }

    changeFieldValue('requestingPairs', true)
    requestForTableDataOfPairs(
      // { srcTokenName: tmpPairsSrctoken },
      {},
      {
        successCb: () => {
          changeFieldValue('spinningPairs', false)
          changeFieldValue('requestingPairs', false)
        },
        failCb: () => {
          changeFieldValue('spinningPairs', false)
          changeFieldValue('requestingPairs', false)
        },
      },
    )
  }

  urlSearchHandler = () => {
    const {
      location: { search },
    } = this.props

    const urlSearchObj = queryString.parse(search)

    if (
      Object.prototype.toString.call(urlSearchObj) === '[object Object]' &&
      Object.keys(urlSearchObj).length > 0
    ) {
      const { x, y } = urlSearchObj

      this.requestForTableDataOfPairs(x, y)

      this.requestForDataOfPair(x, y, true)
    } else {
      this.initPair()
    }
  }

  initPair = () => {
    const {
      changeFieldValue,
      requestForTableDataOfPairs,
      location: { search },
    } = this.props

    // const tmpPairsSrctoken = srcTokensMap[srcToken.tokenName]
    //   ? srcToken.tokenName
    //   : defaultSrcTokens

    const urlSearchObj = queryString.parse(search)

    changeFieldValue('requestingPairs', true)
    requestForTableDataOfPairs(
      {
        // srcTokenName: tmpPairsSrctoken,
      },
      {
        successCb: (array) => {
          if (
            Object.prototype.toString.call(urlSearchObj) !== '[object Object]' ||
            Object.keys(urlSearchObj).length <= 0
          ) {
            if (array && array.length > 0) {
              const latestData = this.getTokens(array[0])

              this.requestForDataOfPair(
                latestData.dstToken.tokenName,
                latestData.srcToken.tokenName,
                true,
              )
            }
          }

          changeFieldValue('spinningPairs', false)
          changeFieldValue('requestingPairs', false)
        },
        failCb: () => {
          changeFieldValue('spinningPairs', false)
          changeFieldValue('requestingPairs', false)
        },
      },
    )

    return true
  }

  getTokens = (data, setValue = false) => {
    const { tradingType, changeFieldValue } = this.props

    const {
      id,

      tokenxName,
      tokenxSymbol,
      tokenxContract,
      tokenxPre,

      tokenyName,
      tokenySymbol,
      tokenyContract,
      tokenyPre,

      type,
      needToReverse,
    } = data

    const srcToken = {
      tokenName: tokenyName,
      symbol: tokenySymbol,
      contract: tokenyContract,
      pre: tokenyPre,
    }

    const dstToken = {
      tokenName: tokenxName,
      symbol: tokenxSymbol,
      contract: tokenxContract,
      pre: tokenxPre,
    }

    if (setValue) {
      if (Object.prototype.toString.call(needToReverse) === '[object Boolean]') {
        changeFieldValue('needToReverse', needToReverse)
      }

      changeFieldValue('srcToken', srcToken)
      changeFieldValue('dstToken', dstToken)
      changeFieldValue('pairId', id)

      if (tradingType !== type) {
        changeFieldValue('tradingType', type)
        changeFieldValue('tradingPanelTab', tradeTypeMap[type].defaultValue)
        changeFieldValue('mobileCurrenTradeCard', tradeTypeMap[type].defaultCardValue)
      }
    }

    return {
      srcToken,
      dstToken,
      type,
    }
  }

  setPricesOfPriceLimit = (type, value) => {
    const { changeFieldValue } = this.props

    changeFieldValue('priceLimitBuyPrice', value)
    changeFieldValue('priceLimitBuyPriceObj', {})
    changeFieldValue('priceLimitSellPrice', value)
    changeFieldValue('priceLimitSellPriceObj', {})
  }

  openNotificationOfRequestingContract = () => {
    notification.info({
      key: 'REQUESTING_CONTRACT',
      message: intl.get('REQUESTING_CONTRACT'),
      duration: null,
      placement: 'bottomLeft',
    })
  }

  closeNotificationOfRequestingContract = () => {
    notification.info({
      key: 'REQUESTING_CONTRACT',
      message: intl.get('REQUESTING_CONTRACT'),
      duration: 0.5,
      placement: 'bottomLeft',
    })
  }

  getBancorAvailable = (token) => {
    const { tableRowOfAccounts } = this.props

    const tmpAvailable = tableRowOfAccounts[token.tokenName]
      ? getStrWithPrecision(new BigNumber(tableRowOfAccounts[token.tokenName].quantity), token.pre)
      : getStrWithPrecision(new BigNumber(0), token.pre)

    return tmpAvailable
  }

  checkCoinStatus = (data) => {
    const { token, available } = data

    if (token.tokenName === 'FOUSDT@eosio') {
      const tmpAmount = new BigNumber(available || 0)

      if (window.fowallet) {
        const dappHrefFuc = () => {
          if (window.fowallet.requestPushDapp) {
            window.fowallet.requestPushDapp(
              {
                dappUrl: 'https://kilmas.github.io/deotc/',
              },
              (error) => {
                if (error) {
                  message.error(error)
                }
              },
            )
          }
        }

        if (tmpAmount.eq(0)) {
          Modal.confirm({
            title: intl.get('FOUSDT_EQUAL_ZERO'),
            content: intl.get('FOUSDT_EQUAL_ZERO_DES'),
            okText: intl.get('YES'),
            cancelText: intl.get('NO'),
            onOk: dappHrefFuc,
          })

          return true
        }
      }
    }

    return false
  }

  requestForProductionData() {
    const {
      dstToken,
      changeFieldValue,
      requestForProductionData,
      resetTokenPairDetail,
    } = this.props

    resetTokenPairDetail()
    changeFieldValue('requestingProductionData', true)
    requestForProductionData(
      { tokenName: dstToken.tokenName },
      {
        successCb: () => {
          changeFieldValue('spinningProductionData', false)
          changeFieldValue('requestingProductionData', false)
        },
        failCb: () => {
          changeFieldValue('spinningProductionData', false)
          changeFieldValue('requestingProductionData', false)
        },
      },
    )
  }

  checkRepo() {
    const { pairId } = this.props

    const { requestForTableDataTotalOfRepo } = this.props

    requestForTableDataTotalOfRepo({
      pairId,
    })
  }

  render() {
    const {
      mobileNavHeight,

      srcToken,
      dstToken,
      needToReverse,

      mobileTabKey,
      tradingPanelTab,
      mobileCurrenTradeCard,

      spinningKDataOfPair,
      oneDayKdata,
      transPairDetail,
      tradingType,

      lastPrice,

      tokenPairDetail,
      repoDataTotal,

      showTradePanel,

      changeFieldValue,
    } = this.props

    return (
      <div className={styles.wrapper} id="mobileexchangeconainer">
        <div className={styles.content}>
          <div className={styles.contentRow}>
            <CandlestickChart
              srcTokenName={srcToken.tokenName}
              dstTokenName={dstToken.tokenName}
              needToReverse={needToReverse}
              symbol={`${dstToken.tokenName}/${srcToken.tokenName}`}
              pre={dstToken.pre}
              pricePre={srcToken.pre}
              spinning={spinningKDataOfPair}
              oneDayKdata={oneDayKdata}
              transPairDetail={transPairDetail}
              detailData={tokenPairDetail}
              lastPrice={lastPrice}
            />
          </div>
          <div className={styles.contentRow}>
            <Handicap setPricesOfPriceLimit={this.setPricesOfPriceLimit} />
          </div>
          <Menu
            className={styles.menu}
            onClick={(e) => {
              changeFieldValue('mobileTabKey', e.key)
            }}
            selectedKeys={[mobileTabKey]}
            mode="horizontal">
            <Menu.Item key="record">{intl.get('RECORD_TITLE')}</Menu.Item>
            {tradingType === 'uniswap' && (
              <Menu.Item key="delegate">{intl.get('DELEGATE_TITLE')}</Menu.Item>
            )}
            {tradingType === 'uniswap' && (
              <Menu.Item key="hold">{intl.get('HOLD_TITLE')}</Menu.Item>
            )}
            {repoDataTotal > 0 && <Menu.Item key="repo">{intl.get('REPO_TITLE')}</Menu.Item>}
            {tradingType === 'uniswap' && tokenPairDetail.id && (
              <Menu.Item key="brief">{intl.get('BRIEF_TITLE')}</Menu.Item>
            )}
          </Menu>
          {mobileTabKey === 'record' && <RecordTable />}
          {mobileTabKey === 'delegate' && <DelegateTable />}
          {mobileTabKey === 'hold' && (
            <div className={styles.contentRow}>
              <Rank />
            </div>
          )}
          {mobileTabKey === 'hold' && tradingType !== 'uniswap' && (
            <div className={styles.contentRow}>
              <Infos />
            </div>
          )}
          {mobileTabKey === 'repo' && <RepoTable />}
          {mobileTabKey === 'brief' && <ProductionDetail producitonId={tokenPairDetail.id} />}
        </div>
        <div className={styles.actionWrapper}>
          <div className={styles.btnsWrapper}>
            <div
              className={
                tradingType === 'bancor'
                  ? classnames(styles.buyOrSell, styles.buyOrSellOfFull)
                  : styles.buyOrSell
              }>
              <Button
                className={styles.buyBtn}
                onClick={() => {
                  // const bancorAvailableSrcToken = this.getBancorAvailable(srcToken)
                  // const showHrefModal = this.checkCoinStatus({
                  //   token: srcToken,
                  //   available: bancorAvailableSrcToken,
                  // })
                  // if (showHrefModal) return

                  changeFieldValue('showTradePanel', true)

                  if (
                    mobileCurrenTradeCard === 'lower_hold_of_buy' ||
                    mobileCurrenTradeCard === 'lower_hold_of_sell'
                  ) {
                    changeFieldValue('tradingPanelTab', 'price_limit')
                    changeFieldValue('mobileCurrenTradeCard', 'price_limit_of_buy')
                  } else if (mobileCurrenTradeCard.indexOf('_of_sell') > 0) {
                    changeFieldValue('mobileCurrenTradeCard', `${tradingPanelTab}_of_buy`)
                  }
                }}>
                {intl.get('BUY_BUTTON')}
                <div className={styles.triangle} />
              </Button>
              <Button
                className={styles.sellBtn}
                onClick={() => {
                  // const bancorAvailableDstToken = this.getBancorAvailable(dstToken)
                  // const showHrefModal = this.checkCoinStatus({
                  //   token: dstToken,
                  //   available: bancorAvailableDstToken,
                  // })
                  // if (showHrefModal) return

                  changeFieldValue('showTradePanel', true)

                  if (
                    mobileCurrenTradeCard === 'lower_hold_of_buy' ||
                    mobileCurrenTradeCard === 'lower_hold_of_sell'
                  ) {
                    changeFieldValue('tradingPanelTab', 'price_limit')
                    changeFieldValue('mobileCurrenTradeCard', 'price_limit_of_sell')
                  } else if (mobileCurrenTradeCard.indexOf('_of_buy') > 0) {
                    changeFieldValue('mobileCurrenTradeCard', `${tradingPanelTab}_of_sell`)
                  }
                }}>
                <div className={styles.triangle} />
                {intl.get('SELL_BUTTON')}
              </Button>
            </div>
            {tradingType !== 'bancor' && (
              <div className={styles.holdBtnWrapper}>
                <Button
                  className={styles.holdBtn}
                  onClick={() => {
                    changeFieldValue('showTradePanel', true)
                    changeFieldValue('tradingPanelTab', 'lower_hold')
                    changeFieldValue('mobileCurrenTradeCard', 'lower_hold_of_buy')
                  }}>
                  {intl.get('HOLD_BUTTON')}
                </Button>
              </div>
            )}
          </div>
        </div>
        <Drawer
          className={styles.drawWrapper}
          visible={showTradePanel}
          height={360 + (mobileNavHeight > 0 ? mobileNavHeight + mobileTitleNavHeight : 0)}
          closable={false}
          placement="top"
          onClose={() => {
            changeFieldValue('showTradePanel', false)
          }}>
          <TradePanel />
        </Drawer>
      </div>
    )
  }
}

export default withRouter(withBack(MobileExchange))
