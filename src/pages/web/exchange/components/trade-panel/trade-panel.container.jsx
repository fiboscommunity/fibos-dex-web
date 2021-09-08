import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import TradePanel from './trade-panel.component'

const mapStateToProps = state => {
  const {
    spinningTradingPanel,
    requestingTradingPanel,
    ironmanReady,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,
    tradingPanelTab,
    tableRowOfAccounts,

    toBuyInputValueBottom,
    toBuyInputValueBottomObj,
    toBuySliderValue,
    toSellInputValueBottom,
    toSellInputValueBottomObj,
    toSellSliderValue,

    spinningUniswapAvailable,
    requestingUniswapAvailable,
    uniswapAvailableSrcToken,
    uniswapAvailableDstToken,

    toChargeInputValueTop,
    toChargeInputValueTopObj,

    toChargeInputValueBottom,
    toChargeInputValueBottomObj,

    extractInputValueTop,
    extractInputValueTopObj,

    extractInputValueBottom,
    extractInputValueBottomObj,

    extractSliderValue,

    priceLimitBuyPrice,
    priceLimitBuyPriceObj,
    priceLimitBuyAmount,
    priceLimitBuyAmountObj,
    priceLimitBuyQunitity,
    priceLimitBuySliderValue,

    priceLimitSellPrice,
    priceLimitSellPriceObj,
    priceLimitSellAmount,
    priceLimitSellAmountObj,
    priceLimitSellQunitity,
    priceLimitSellSliderValue,

    infoData,
    transPairDetail,
    accountPairData,

    requestingContract,
  } = state.exchange
  const { uniswapPrice } = transPairDetail
  const { ironman, ironmanData, ironmanError, ironmanMissing, toLogin } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    spinningTradingPanel,
    requestingTradingPanel,
    ironman,
    ironmanData,
    ironmanError,
    ironmanMissing,
    ironmanReady,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,
    tradingPanelTab,
    tableRowOfAccounts,

    toLogin,

    toBuyInputValueBottom,
    toBuyInputValueBottomObj,
    toBuySliderValue,

    toSellInputValueBottom,
    toSellInputValueBottomObj,
    toSellSliderValue,

    spinningUniswapAvailable,
    requestingUniswapAvailable,
    uniswapAvailableSrcToken,
    uniswapAvailableDstToken,

    toChargeInputValueTop,
    toChargeInputValueTopObj,

    toChargeInputValueBottom,
    toChargeInputValueBottomObj,

    extractInputValueTop,
    extractInputValueTopObj,

    extractInputValueBottom,
    extractInputValueBottomObj,

    extractSliderValue,

    priceLimitBuyPrice,
    priceLimitBuyPriceObj,
    priceLimitBuyAmount,
    priceLimitBuyAmountObj,
    priceLimitBuyQunitity,
    priceLimitBuySliderValue,

    priceLimitSellPrice,
    priceLimitSellPriceObj,
    priceLimitSellAmount,
    priceLimitSellAmountObj,
    priceLimitSellQunitity,
    priceLimitSellSliderValue,

    buyFee: infoData.buy_fee,
    sellFee: infoData.sell_fee,

    uniswapPrice,
    accountPairData,

    requestingContract,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TradePanel)
