import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import queryString from 'query-string'

import notification from 'antd/lib/notification'
import 'antd/lib/notification/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { tradeTypeMap, pollInterval } from 'Config'

import AddPairs from './components/add-pairs'
import Pairs from './components/pairs'
import CandlestickChart from './components/candlestick-chart'
import Handicap from './components/handicap'
import TradePanel from './components/trade-panel'
import Rank from './components/rank'
import Infos from './components/infos'
import Records from './components/records'

import styles from './exchange.module.css'

class Exchange extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { changeFieldValue } = this.props

    window.scrollTo(0, 0)

    changeFieldValue('spinningPairs', true)
    this.urlSearchHandler(true)

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

      this.requestForTableDataOfPairs(dstToken.tokenName, srcToken.tokenName)
      changeFieldValue('requestingKDataOfPair', true)
      requestForKDataOfPair(
        { tokenx: dstToken.tokenName, tokeny: srcToken.tokenName },
        {
          successCb: kdata => {
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

  requestForDataOfPair = (x, y, toInit = false) => {
    const { changeFieldValue, requestForDataOfPair, requestForKDataOfPair } = this.props

    changeFieldValue('requestDataOfCurrentpair', true)

    requestForDataOfPair(
      { dstTokenName: x, srcTokenName: y },
      {
        successCb: data => {
          if (toInit) {
            this.getTokens(data, true)

            const { tokenxName, tokenyName } = data
            changeFieldValue('spinningKDataOfPair', true)
            changeFieldValue('requestingKDataOfPair', true)
            requestForKDataOfPair(
              { tokenx: tokenxName, tokeny: tokenyName },
              {
                successCb: kdata => {
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
        successCb: array => {
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

  checkRepo() {
    const { pairId } = this.props

    const { requestForTableDataTotalOfRepo } = this.props

    requestForTableDataTotalOfRepo({
      pairId,
    })
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

  render() {
    const {
      srcToken,
      dstToken,
      needToReverse,

      spinningKDataOfPair,
      oneDayKdata,
      transPairDetail,
      tradingType,

      lastPrice,

      tokenPairDetail,

      resetPair,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.contentTop}>
          <div className={classnames(styles.contentCol, styles.leftPanels)}>
            <div className={styles.contentRow}>
              <AddPairs />
              <Pairs
                getTokens={this.getTokens}
                // initPair={this.initPair}
                resetPair={() => {
                  message.success(intl.get('PAIRS_RESETED'))
                  resetPair()
                }}
              />
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
              {tradingType !== 'uniswap' && <Infos />}
              {tradingType === 'uniswap' && <Rank />}
              <TradePanel />
            </div>
          </div>
          {tradingType === 'uniswap' && (
            <div className={classnames(styles.contentCol, styles.rightPanel)}>
              <Handicap setPricesOfPriceLimit={this.setPricesOfPriceLimit} />
            </div>
          )}
        </div>
        <div className={styles.contentBottom}>
          <div className={styles.contentCol}>
            <div className={styles.contentRow}>
              <Records tableRows={10} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Exchange
