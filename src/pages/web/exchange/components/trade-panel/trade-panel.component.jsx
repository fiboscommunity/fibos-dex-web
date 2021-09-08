import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import { SpinWrapper } from 'Components'
import { tradeTypeMap, contractPrecision, pollInterval } from 'Config'
import { checkInputVal, getStrWithPrecision, contractErrorCollector } from 'Utils'

import styles from './trade-panel.module.css'
import TradeCardBancor from './components/trade-card-bancor'
import TradeCardUniswap from './components/trade-card-uniswap'
import TradeCardUniswapPriceLimit from './components/trade-card-uniswap-price-limit'
import Card from '../card'

class TradePanel extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.initPanelAvailable()
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const {
      dstToken,
      tradingType,
      ironmanData,
      ironmanReady,

      resetAvailable,
      resetPanelFormData,
      changeFieldValue,
    } = this.props

    if (
      (!prevProps.ironmanData && ironmanData) ||
      (!ironmanReady && !prevProps.ironmanReady && ironmanData && prevProps.ironmanData)
    ) {
      changeFieldValue('ironmanReady', true)
      resetPanelFormData()
      this.checkAvailable(ironmanData)
    }

    if (
      ironmanData &&
      dstToken.tokenName &&
      prevProps.dstToken.tokenName &&
      prevProps.dstToken.tokenName !== dstToken.tokenName
    ) {
      resetPanelFormData()
      this.checkAvailable(ironmanData)
    }

    if (!prevProps.tradingType && tradingType) {
      const tmpTradingPanelTab = tradeTypeMap[tradingType]
        ? tradeTypeMap[tradingType].defaultValue
        : tradeTypeMap.default.defaultValue

      changeFieldValue('tradingPanelTab', tmpTradingPanelTab)
    }

    const { ironman } = this.props

    if (ironman && !prevProps.ironmanData && ironmanData) {
      this.initPanelAvailable()
    }

    if (ironman && prevProps.ironmanData && !ironmanData) {
      resetAvailable()
    }

    const { requestingTradingPanel } = this.props

    if (
      ironmanData &&
      ironmanData.fibos &&
      !requestingTradingPanel &&
      requestingTradingPanel !== prevProps.requestingTradingPanel
    ) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    if (
      (!ironmanData || !ironmanData.fibos) &&
      prevProps.ironmanData &&
      prevProps.ironmanData.fibos
    ) {
      clearTimeout(this.timeout)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  startPoll = () => {
    const { ironmanData } = this.props
    const { fibos } = ironmanData

    if (!fibos) return

    this.timeout = setTimeout(() => {
      this.checkAvailable(ironmanData)
    }, pollInterval)
  }

  initPanelAvailable = () => {
    const { ironmanData, ironmanReady, resetPanelFormData } = this.props

    if (ironmanData && !ironmanReady) {
      resetPanelFormData()
      this.checkAvailable(ironmanData)
    }
  }

  checkBeforeContractReq = () => {
    const {
      ironmanData: { fibos },
      requestingContract,
      uniswapPrice,
      tradingType,
    } = this.props

    if (requestingContract) {
      message.warning(intl.get('WAITING_FOR_REQUEST'))

      return false
    }

    if (!fibos) {
      message.error(intl.get('EXTENSION_MISSING'))

      return false
    }

    if (tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0)) {
      message.error(intl.get('UNISWAPPRICE_EQUAL_ZERO'))

      return false
    }

    return true
  }

  reqExchange = (quantity, tosym) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },

      changeFieldValue,
    } = this.props

    if (fibos) {
      const reqData = {
        id: name,
        owner: name,
        quantity,
        to: tosym,
        price: 0,
        memo: `${quantity} ${tosym}`,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .exchange(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  reqCharge = (dstQuantity, srcQuantity) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },

      changeFieldValue,
    } = this.props

    if (fibos) {
      const reqData = {
        owner: name,
        tokenx: dstQuantity,
        tokeny: srcQuantity,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .addreserves(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  reqExtract = (dstQuantity, srcQuantity, rate) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },

      changeFieldValue,
    } = this.props

    if (fibos) {
      const reqData = {
        owner: name,
        x: dstQuantity,
        y: srcQuantity,
        rate,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .outreserves(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  reqPriceLimitBuy = (price, data) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
      srcToken,
      dstToken,

      changeFieldValue,
    } = this.props

    if (fibos) {
      const reqData = {
        id: name,
        owner: name,
        quantity: `${getStrWithPrecision(0, srcToken.pre)} ${srcToken.tokenName}`,
        to: `${getStrWithPrecision(data, dstToken.pre)} ${dstToken.tokenName}`,
        price: new BigNumber(price).toNumber(),
        memo: `x to ${data} ${price}`,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .exchange(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  reqPriceLimitsell = (price, data) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
      srcToken,
      dstToken,
      priceLimitSellQunitity,

      changeFieldValue,
    } = this.props

    if (fibos) {
      if (new BigNumber(priceLimitSellQunitity).eq(0)) {
        return message.error(intl.get('ACTION_FAIL'))
      }

      const reqData = {
        id: name,
        owner: name,
        quantity: `${getStrWithPrecision(data, dstToken.pre)} ${dstToken.tokenName}`,
        to: `${getStrWithPrecision(0, srcToken.pre)} ${srcToken.tokenName}`,
        price: new BigNumber(
          getStrWithPrecision(new BigNumber(1).div(price), contractPrecision),
        ).toNumber(),
        memo: `${data} to x ${price}`,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .exchange(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)
          })
      })
    }

    return true
  }

  checkAvailable = ironmanData => {
    if (!ironmanData || !ironmanData.fibos) return

    const {
      fibos,
      account: { name },
    } = ironmanData
    const { changeFieldValue } = this.props

    if (fibos) {
      changeFieldValue('requestingTradingPanel', true)
      changeFieldValue('spinningUniswapAvailable', true)

      fibos
        .getTableRows({
          json: true,
          code: 'eosio.token',
          scope: name,
          table: 'accounts',
          limit: 5000,
        })
        .then(reponse => {
          const { rows } = reponse
          const result = {}

          rows.forEach(item => {
            const { contract, quantity } = item.balance
            const quantityArr = quantity.split(' ')

            result[`${quantityArr[1]}@${contract}`] = {
              quantity: quantityArr[0],
              symbol: quantityArr[1],
              contract,
            }
          })

          changeFieldValue('tableRowOfAccounts', result)
          this.getUniswapAvailable()

          changeFieldValue('spinningTradingPanel', false)
          changeFieldValue('requestingTradingPanel', false)
        })
        .catch(error => {
          changeFieldValue('spinningTradingPanel', false)
          changeFieldValue('requestingTradingPanel', false)
          throw new Error(error)
        })
    }
  }

  getUniswapAvailable = () => {
    const {
      ironmanData: {
        account: { name },
      },
      srcToken,
      dstToken,
      changeFieldValue,
      getUniswapAvailable,
    } = this.props

    changeFieldValue('requestingUniswapAvailable', true)
    getUniswapAvailable(
      {
        account: name,
        tokenx: dstToken,
        tokeny: srcToken,
      },
      {
        successCb: () => {
          changeFieldValue('spinningUniswapAvailable', false)
          return changeFieldValue('requestingUniswapAvailable', false)
        },
        failCb: () => {
          changeFieldValue('spinningUniswapAvailable', false)
          return changeFieldValue('requestingUniswapAvailable', false)
        },
      },
    )
  }

  getBancorAvailable = token => {
    const { tableRowOfAccounts } = this.props

    const tmpAvailable = tableRowOfAccounts[token.tokenName]
      ? getStrWithPrecision(new BigNumber(tableRowOfAccounts[token.tokenName].quantity), token.pre)
      : 0

    return tmpAvailable
  }

  checkLoadingStatus = () => {
    const { ironmanError, ironmanMissing } = this.props
    if (ironmanError || ironmanMissing) return false

    const {
      ironmanReady,
      tradingType,
      spinningTradingPanel,
      spinningUniswapAvailable,
      srcToken,
      dstToken,
    } = this.props

    if (ironmanReady) {
      if (tradingType === 'uniswap') {
        return (
          (spinningTradingPanel && spinningUniswapAvailable) ||
          !srcToken.tokenName ||
          !dstToken.tokenName
        )
      }
      return spinningTradingPanel
    }

    return false
  }

  restartPair = () => {
    const { dstToken, srcToken, changeFieldValue } = this.props

    changeFieldValue('addPairType', 'restart')

    changeFieldValue('addPairDstToken', dstToken)
    changeFieldValue('addPairDstTokenName', dstToken.tokenName)
    changeFieldValue('addPairSrcToken', srcToken)
    changeFieldValue('addPairSrcTokenName', srcToken.tokenName)

    changeFieldValue('addPairModalShow', true)
  }

  render() {
    const {
      ironmanData,
      ironmanReady,
      srcToken,
      dstToken,
      tradingType,
      tradingPanelTab,

      toBuyInputValueBottom,
      toBuyInputValueBottomObj,
      toBuySliderValue,

      toSellInputValueBottom,
      toSellInputValueBottomObj,
      toSellSliderValue,

      uniswapPrice,

      toChargeInputValueTop,
      toChargeInputValueTopObj,

      toChargeInputValueBottom,
      toChargeInputValueBottomObj,

      extractInputValueTop,
      extractInputValueTopObj,

      extractInputValueBottom,
      extractInputValueBottomObj,

      uniswapAvailableSrcToken,
      uniswapAvailableDstToken,
      extractSliderValue,

      priceLimitBuyPrice,
      priceLimitBuyPriceObj,
      priceLimitBuyAmount,
      priceLimitSellPriceObj,
      priceLimitBuyQunitity,
      priceLimitBuySliderValue,

      priceLimitSellPrice,
      priceLimitBuyAmountObj,
      priceLimitSellAmount,
      priceLimitSellAmountObj,
      priceLimitSellQunitity,
      priceLimitSellSliderValue,

      accountPairData,

      requestingContract,

      buyFee,
      sellFee,
      changeFieldValue,

      toLogin,
    } = this.props

    const currentMap = tradeTypeMap[tradingType]
      ? tradeTypeMap[tradingType].list
      : tradeTypeMap.default.list

    const title = (
      <div className={styles.menuWrapper}>
        <Menu
          className={styles.menu}
          mode="horizontal"
          defaultSelectedKeys={[currentMap[0].key]}
          selectedKeys={[tradingPanelTab]}
          onSelect={e => {
            changeFieldValue('tradingPanelTab', e.key)
          }}>
          {currentMap.map((item, index) => (
            <Menu.Item
              key={item.key}
              className={index === currentMap.length - 1 ? styles.lastMenuItem : ''}>
              <span className={styles.menutext}>{intl.get(item.intl)}</span>
            </Menu.Item>
          ))}
        </Menu>
      </div>
    )

    const bancorAvailableSrcToken = this.getBancorAvailable(srcToken)
    const bancorAvailableDstToken = this.getBancorAvailable(dstToken)

    const locked =
      accountPairData &&
      (accountPairData.status === 'locked' || accountPairData.status === 'unlocking')

    return (
      <Card className={styles.wrapper} title={title}>
        <div className={styles.content}>
          <SpinWrapper spinning={this.checkLoadingStatus()}>
            <div className={styles.contentPanel}>
              {tradingPanelTab === 'market' && (
                <TradeCardBancor
                  changeFieldValue={changeFieldValue}
                  tokenCost={srcToken}
                  tokenGet={dstToken}
                  tradingType={tradingType}
                  titleTop={intl.get('BUY')}
                  available={bancorAvailableSrcToken}
                  inputTop={`${intl.get('BANCOR_PRICE_TIP')}${intl.get('BUY')}`}
                  inputTopDisabled={tradingType === 'bancor' || tradingType === 'uniswap'}
                  fakeTextInputTop
                  titleBottom={intl.get('TRADE_QUNITITY')}
                  inputBottom={toBuyInputValueBottom}
                  inputBottomObj={toBuyInputValueBottomObj}
                  inputBottomPlaceholder={intl.get('INSERT_AMOUNT')}
                  inputBottomFieldName="toBuyInputValueBottom"
                  inputBottomObjFieldName="toBuyInputValueBottomObj"
                  inputBottomDisabled={
                    (srcToken.isSmart && srcToken.position === 0) ||
                    (tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0))
                  }
                  inputBottomOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('toBuyInputValueBottom', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'toBuyInputValueBottom',
                      getStrWithPrecision(e.target.value, srcToken.pre),
                    )
                    changeFieldValue('toBuyInputValueBottomObj', {})
                  }}
                  inputBottomSuffix={srcToken.symbol}
                  inputBottomTip="right"
                  inputButtonLoading={requestingContract}
                  withSlider
                  sliderDisabled={tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0)}
                  sliderValue={toBuySliderValue}
                  sliderFieldName="toBuySliderValue"
                  sliderStep={0.0001}
                  sliderOnChange={e => {
                    changeFieldValue(
                      'toBuyInputValueBottom',
                      getStrWithPrecision(
                        new BigNumber(bancorAvailableSrcToken).times(e),
                        srcToken.pre,
                      ),
                    )
                    changeFieldValue('toSellInputValueBottomObj', {})
                  }}
                  sliderStyle={styles.sliderStyleBuy}
                  fee={
                    tradingType === 'uniswap'
                      ? tradeTypeMap[tradingType].fee[tradingPanelTab].buy
                      : `${getStrWithPrecision(new BigNumber(buyFee).times(100), 2)} %` || '0 %'
                  }
                  btnText={intl.get('BUY')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={(quantity, tokenName) => {
                    this.reqExchange(quantity, tokenName)

                    return true
                  }}
                  btnStatus={
                    !ironmanReady || (srcToken.isSmart && srcToken.position === 0) || !ironmanData
                  }
                  buttonStyle={styles.buyBtn}
                  color={styles.tipStyleBuy}
                  toLogin={toLogin}
                />
              )}
              {tradingType === 'uniswap' && tradingPanelTab === 'lower_hold' && (
                <TradeCardUniswap
                  changeFieldValue={changeFieldValue}
                  srcToken={srcToken}
                  dstToken={dstToken}
                  tradingType={tradingType}
                  uniswapPrice={uniswapPrice}
                  titleTop={intl.get('CHARGE')}
                  inputTop={toChargeInputValueTop}
                  inputTopObj={toChargeInputValueTopObj}
                  inputTopPlaceholder={intl.get('INSERT_AMOUNT')}
                  inputTopFieldName="toChargeInputValueTop"
                  inputTopObjFieldName="toChargeInputValueTopObj"
                  inputTopOnBlur={e => {
                    if (!uniswapPrice || !checkInputVal(e.target.value)) {
                      changeFieldValue('toChargeInputValueTop', e.target.value.trim())
                      changeFieldValue('toChargeInputValueBottom', undefined)
                      changeFieldValue('toChargeInputValueBottomObj', {})

                      return true
                    }

                    const tmpTopBignumber = new BigNumber(e.target.value)
                    const tmpTop = getStrWithPrecision(tmpTopBignumber, srcToken.pre)

                    if (e.target.value === tmpTop) return true

                    changeFieldValue('toChargeInputValueTop', tmpTop)

                    return true
                  }}
                  inputTopSuffix={srcToken.symbol}
                  inputTopTip="right"
                  availableTop={bancorAvailableSrcToken}
                  availableTopSymbol={srcToken.symbol}
                  availableTopPre={srcToken.pre}
                  inputBottom={toChargeInputValueBottom}
                  inputBottomObj={toChargeInputValueBottomObj}
                  inputBottomPlaceholder={intl.get('INSERT_AMOUNT')}
                  inputBottomFieldName="toChargeInputValueBottom"
                  inputBottomObjFieldName="toChargeInputValueBottomObj"
                  inputBottomDisabled={
                    tradingType === 'bancor' || new BigNumber(uniswapPrice).lte(0)
                  }
                  inputBottomOnBlur={e => {
                    if (!uniswapPrice || !checkInputVal(e.target.value)) {
                      changeFieldValue('toChargeInputValueTop', undefined)
                      changeFieldValue('toChargeInputValueTopObj', {})
                      changeFieldValue('toChargeInputValueBottom', e.target.value.trim())

                      return true
                    }

                    const tmpBottomBignumber = new BigNumber(e.target.value)
                    const tmpBottom = getStrWithPrecision(tmpBottomBignumber, dstToken.pre)

                    if (e.target.value === tmpBottom) return true

                    changeFieldValue('toChargeInputValueBottom', tmpBottom)

                    return true
                  }}
                  inputBottomSuffix={dstToken.symbol}
                  inputBottomTip="right"
                  availableBottom={bancorAvailableDstToken}
                  availableBottomSymbol={dstToken.symbol}
                  availableBottomPre={dstToken.pre}
                  inputButtonLoading={requestingContract}
                  fee={tradeTypeMap[tradingType].fee[tradingPanelTab].charge || '0 %'}
                  btnText={intl.get('CHARGE')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={this.reqCharge}
                  btnStatus={
                    !ironmanReady ||
                    (dstToken.isSmart && dstToken.position === 0) ||
                    !bancorAvailableSrcToken ||
                    !bancorAvailableDstToken ||
                    !ironmanData
                  }
                  buttonStyle={styles.buyBtn}
                  color={styles.tipStyleBuy}
                  toLogin={toLogin}
                />
              )}
              {tradingType === 'uniswap' && tradingPanelTab === 'price_limit' && (
                <TradeCardUniswapPriceLimit
                  changeFieldValue={changeFieldValue}
                  srcToken={srcToken}
                  dstToken={dstToken}
                  titleTop={intl.get('BUY')}
                  availableValidateType="times"
                  available={bancorAvailableSrcToken}
                  availableSymbol={srcToken.symbol}
                  availablePre={srcToken.pre}
                  inputTop={priceLimitBuyPrice}
                  inputTopObj={priceLimitBuyPriceObj}
                  inputTopPlaceholder={intl.get('BUY_PRICE')}
                  inputTopOnChange={() => {}}
                  inputTopOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('priceLimitBuyPrice', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'priceLimitBuyPrice',
                      getStrWithPrecision(e.target.value, srcToken.pre),
                    )
                  }}
                  inputTopFieldName="priceLimitBuyPrice"
                  inputTopObjFieldName="priceLimitBuyPriceObj"
                  inputTopSuffix={srcToken.symbol}
                  inputTopTip="right"
                  inputBottom={priceLimitBuyAmount}
                  inputBottomObj={priceLimitBuyAmountObj}
                  inputBottomPlaceholder={intl.get('BUY_AMOUNT')}
                  inputBottomFieldName="priceLimitBuyAmount"
                  inputBottomObjFieldName="priceLimitBuyAmountObj"
                  inputBottomDisabled={
                    bancorAvailableSrcToken === 0 || new BigNumber(uniswapPrice).lte(0)
                  }
                  inputBottomOnChange={() => {}}
                  inputBottomOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('priceLimitBuyAmount', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'priceLimitBuyAmount',
                      getStrWithPrecision(e.target.value, dstToken.pre),
                    )

                    if (checkInputVal(priceLimitBuyPrice)) {
                      changeFieldValue(
                        'priceLimitBuyQunitity',
                        getStrWithPrecision(
                          new BigNumber(e.target.value).times(priceLimitBuyPrice),
                          dstToken.pre,
                        ),
                      )
                    }
                  }}
                  inputBottomSuffix={dstToken.symbol}
                  inputBottomTip="right"
                  inputButtonLoading={requestingContract}
                  tradeQunitity={priceLimitBuyQunitity || 0}
                  tradeQunitityFieldName="priceLimitBuyQunitity"
                  tradeQunititySymbol={srcToken.symbol}
                  withSlider
                  sliderDisabled={
                    bancorAvailableSrcToken === 0 ||
                    !priceLimitBuyPrice ||
                    Number.isNaN(parseFloat(priceLimitBuyPrice)) ||
                    new BigNumber(uniswapPrice).lte(0)
                  }
                  sliderValue={priceLimitBuySliderValue}
                  sliderFieldName="priceLimitBuySliderValue"
                  sliderStep={1}
                  sliderOnChange={e => {
                    const tmpTotal = new BigNumber(e).div(1000000).times(bancorAvailableSrcToken)
                    changeFieldValue(
                      'priceLimitBuyQunitity',
                      getStrWithPrecision(tmpTotal, srcToken.pre),
                    )

                    const tmpAmount = tmpTotal.div(priceLimitBuyPrice)
                    changeFieldValue(
                      'priceLimitBuyAmount',
                      getStrWithPrecision(tmpAmount, dstToken.pre),
                    )
                    changeFieldValue('priceLimitBuyAmountObj', {})
                  }}
                  sliderStyle={styles.sliderStyleBuy}
                  fee={tradeTypeMap[tradingType].fee[tradingPanelTab].buy || '0 %'}
                  btnText={intl.get('BUY')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={this.reqPriceLimitBuy}
                  btnStatus={
                    !ironmanReady || (dstToken.isSmart && dstToken.position === 0) || !ironmanData
                  }
                  buttonStyle={styles.buyBtn}
                  color={styles.tipStyleBuy}
                  toLogin={toLogin}
                />
              )}
            </div>
            <div className={styles.contentPanel}>
              {tradingPanelTab === 'market' && (
                <TradeCardBancor
                  changeFieldValue={changeFieldValue}
                  tokenCost={dstToken}
                  tokenGet={srcToken}
                  tradingType={tradingType}
                  titleTop={intl.get('SELL')}
                  available={bancorAvailableDstToken}
                  inputTop={`${intl.get('BANCOR_PRICE_TIP')}${intl.get('SELL')}`}
                  inputTopDisabled={tradingType === 'bancor' || tradingType === 'uniswap'}
                  fakeTextInputTop
                  titleBottom={intl.get('TRADE_AMOUNT')}
                  inputBottom={toSellInputValueBottom}
                  inputBottomObj={toSellInputValueBottomObj}
                  inputBottomPlaceholder={intl.get('INSERT_AMOUNT')}
                  inputBottomFieldName="toSellInputValueBottom"
                  inputBottomObjFieldName="toSellInputValueBottomObj"
                  inputBottomDisabled={
                    (dstToken.isSmart && dstToken.position === 0) ||
                    (tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0))
                  }
                  inputBottomOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('toSellInputValueBottom', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'toSellInputValueBottom',
                      getStrWithPrecision(e.target.value, dstToken.pre),
                    )
                    changeFieldValue('toSellInputValueBottomObj', {})
                  }}
                  inputBottomSuffix={dstToken.symbol}
                  inputBottomTip="right"
                  inputButtonLoading={requestingContract}
                  withSlider
                  sliderDisabled={tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0)}
                  sliderValue={toSellSliderValue}
                  sliderFieldName="toSellSliderValue"
                  sliderStep={0.0001}
                  sliderOnChange={e => {
                    changeFieldValue(
                      'toSellInputValueBottom',
                      getStrWithPrecision(
                        new BigNumber(bancorAvailableDstToken).times(e),
                        dstToken.pre,
                      ),
                    )
                    changeFieldValue('toSellInputValueBottomObj', {})
                  }}
                  sliderStyle={styles.sliderStyleSell}
                  fee={
                    tradingType === 'uniswap'
                      ? tradeTypeMap[tradingType].fee[tradingPanelTab].sell || '0 %'
                      : `${getStrWithPrecision(new BigNumber(sellFee).times(100), 2)} %` || '0 %'
                  }
                  btnText={intl.get('SELL')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={(quantity, tokenName) => {
                    this.reqExchange(quantity, tokenName)

                    return true
                  }}
                  btnStatus={
                    !ironmanReady || (dstToken.isSmart && dstToken.position === 0) || !ironmanData
                  }
                  buttonStyle={styles.sellBtn}
                  color={styles.tipStyleSell}
                  toLogin={toLogin}
                />
              )}
              {tradingType === 'uniswap' && tradingPanelTab === 'lower_hold' && (
                <TradeCardUniswap
                  changeFieldValue={changeFieldValue}
                  srcToken={srcToken}
                  dstToken={dstToken}
                  tradingType={tradingType}
                  uniswapPrice={uniswapPrice}
                  titleTop={intl.get('EXTRACT')}
                  inputTop={extractInputValueTop}
                  inputTopObj={extractInputValueTopObj}
                  inputTopPlaceholder={intl.get('CHOOSE_HOLD_RATE')}
                  inputTopFieldName="extractInputValueTop"
                  inputTopObjFieldName="extractInputValueTopObj"
                  inputTopDisabled={
                    tradingType === 'bancor' ||
                    new BigNumber(uniswapAvailableDstToken).lte(0) ||
                    new BigNumber(uniswapAvailableSrcToken).lte(0) ||
                    new BigNumber(uniswapPrice).lte(0) ||
                    locked
                  }
                  inputTopOnBlur={e => {
                    if (!uniswapPrice || !checkInputVal(e.target.value)) {
                      changeFieldValue('extractInputValueTop', e.target.value.trim())
                      changeFieldValue('extractInputValueBottom', undefined)
                      changeFieldValue('extractInputValueBottomObj', {})

                      return true
                    }

                    const tmpTopBignumber = new BigNumber(e.target.value)
                    const tmpTop = getStrWithPrecision(tmpTopBignumber, srcToken.pre)

                    if (e.target.value === tmpTop) return true

                    changeFieldValue('extractInputValueTop', tmpTop)
                    changeFieldValue('extractInputValueTopObj', {})

                    return true
                  }}
                  inputTopSuffix={srcToken.symbol}
                  inputTopTip="right"
                  availableTop={uniswapAvailableSrcToken || 0}
                  availableTopSymbol={srcToken.symbol}
                  availableTopPre={srcToken.pre}
                  inputBottom={extractInputValueBottom}
                  inputBottomObj={extractInputValueBottomObj}
                  inputBottomObjFieldName="extractInputValueBottomObj"
                  inputBottomPlaceholder={intl.get('CHOOSE_HOLD_RATE')}
                  inputBottomFieldName="extractInputValueBottom"
                  inputBottomDisabled={
                    tradingType === 'bancor' ||
                    new BigNumber(uniswapAvailableDstToken).lte(0) ||
                    new BigNumber(uniswapAvailableSrcToken).lte(0) ||
                    new BigNumber(uniswapPrice).lte(0) ||
                    locked
                  }
                  inputBottomOnBlur={e => {
                    if (!uniswapPrice || !checkInputVal(e.target.value)) {
                      changeFieldValue('extractInputValueTop', undefined)
                      changeFieldValue('extractInputValueTopObj', {})
                      changeFieldValue('extractInputValueBottom', e.target.value.trim())

                      return true
                    }

                    const tmpBottomBignumber = new BigNumber(e.target.value)
                    const tmpBottom = getStrWithPrecision(tmpBottomBignumber, dstToken.pre)

                    if (e.target.value === tmpBottom) return true

                    changeFieldValue('extractInputValueBottom', tmpBottom)
                    changeFieldValue('extractInputValueBottomObj', {})

                    return true
                  }}
                  inputBottomSuffix={dstToken.symbol}
                  inputBottomTip="right"
                  inputButtonLoading={requestingContract}
                  availableBottom={uniswapAvailableDstToken || 0}
                  availableBottomSymbol={dstToken.symbol}
                  availableBottomPre={dstToken.pre}
                  withSlider
                  sliderValue={extractSliderValue}
                  sliderValueFieldName="extractSliderValue"
                  sliderDisabled={new BigNumber(uniswapPrice).lte(0)}
                  sliderOnAfterChange={e => {
                    changeFieldValue('extractSliderValue', parseFloat(getStrWithPrecision(e, 4)))
                  }}
                  sliderStyle={styles.sliderStyleSell}
                  fee={tradeTypeMap[tradingType].fee[tradingPanelTab].extract || '0 %'}
                  btnText={intl.get('EXTRACT')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={this.reqExtract}
                  btnStatus={
                    !ironmanReady ||
                    (dstToken.isSmart && dstToken.position === 0) ||
                    !ironmanData ||
                    locked
                  }
                  buttonStyle={styles.sellBtn}
                  color={styles.tipStyleSell}
                  locked={locked}
                  ironmanData={ironmanData}
                  toLogin={toLogin}
                />
              )}
              {tradingType === 'uniswap' && tradingPanelTab === 'price_limit' && (
                <TradeCardUniswapPriceLimit
                  changeFieldValue={changeFieldValue}
                  srcToken={srcToken}
                  dstToken={dstToken}
                  titleTop={intl.get('SELL')}
                  available={bancorAvailableDstToken}
                  availableSymbol={dstToken.symbol}
                  availablePre={dstToken.pre}
                  availableValidateType="inputBottom"
                  inputTop={priceLimitSellPrice}
                  inputTopObj={priceLimitSellPriceObj}
                  inputTopPlaceholder={intl.get('SELL_PRICE')}
                  inputTopOnChange={() => {}}
                  inputTopOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('priceLimitSellPrice', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'priceLimitSellPrice',
                      getStrWithPrecision(e.target.value, srcToken.pre),
                    )
                  }}
                  inputTopFieldName="priceLimitSellPrice"
                  inputTopObjFieldName="priceLimitSellPriceObj"
                  inputTopSuffix={srcToken.symbol}
                  inputTopTip="right"
                  inputBottom={priceLimitSellAmount}
                  inputBottomObj={priceLimitSellAmountObj}
                  inputBottomPlaceholder={intl.get('SELL_AMOUNT')}
                  inputBottomFieldName="priceLimitSellAmount"
                  inputBottomObjFieldName="priceLimitSellAmountObj"
                  inputBottomDisabled={
                    bancorAvailableDstToken === 0 || new BigNumber(uniswapPrice).lte(0)
                  }
                  inputBottomOnChange={() => {}}
                  inputBottomOnBlur={e => {
                    if (!checkInputVal(e.target.value)) {
                      changeFieldValue('priceLimitSellAmount', e.target.value.trim())
                      return
                    }

                    changeFieldValue(
                      'priceLimitSellAmount',
                      getStrWithPrecision(e.target.value, dstToken.pre),
                    )
                  }}
                  inputBottomSuffix={dstToken.symbol}
                  inputBottomTip="right"
                  inputButtonLoading={requestingContract}
                  tradeQunitity={priceLimitSellQunitity || 0}
                  tradeQunitityFieldName="priceLimitSellQunitity"
                  tradeQunititySymbol={srcToken.symbol}
                  withSlider
                  sliderDisabled={
                    bancorAvailableDstToken === 0 ||
                    !priceLimitSellPrice ||
                    Number.isNaN(parseFloat(priceLimitSellPrice)) ||
                    new BigNumber(uniswapPrice).lte(0)
                  }
                  sliderValue={priceLimitSellSliderValue}
                  sliderFieldName="priceLimitSellSliderValue"
                  // sliderStep={10 ** -srcToken.pre}
                  sliderStep={1}
                  sliderOnChange={e => {
                    const tmpAmount = new BigNumber(e).div(1000000).times(bancorAvailableDstToken)
                    changeFieldValue(
                      'priceLimitSellAmount',
                      getStrWithPrecision(tmpAmount, dstToken.pre),
                    )
                    changeFieldValue('priceLimitSellAmountObj', {})

                    const priceLimitSellPriceBigNumber = new BigNumber(priceLimitSellPrice)

                    if (
                      bancorAvailableDstToken > 0 &&
                      priceLimitSellPrice &&
                      priceLimitSellPriceBigNumber.gt(0)
                    ) {
                      const tmpTotal = tmpAmount.times(priceLimitSellPriceBigNumber)

                      changeFieldValue(
                        'priceLimitSellQunitity',
                        getStrWithPrecision(tmpTotal, srcToken.pre),
                      )
                    }
                  }}
                  sliderStyle={styles.sliderStyleSell}
                  fee={tradeTypeMap[tradingType].fee[tradingPanelTab].sell || '0 %'}
                  btnText={intl.get('SELL')}
                  beforeValidate={this.checkBeforeContractReq}
                  comfirmFuc={this.reqPriceLimitsell}
                  btnStatus={
                    !ironmanReady || (dstToken.isSmart && dstToken.position === 0) || !ironmanData
                  }
                  buttonStyle={styles.sellBtn}
                  color={styles.tipStyleSell}
                  toLogin={toLogin}
                />
              )}
            </div>
            {tradingType === 'uniswap' && new BigNumber(uniswapPrice).lte(0) && (
              <div className={styles.maskWrapper}>
                <div className={styles.maskContent} />
                <div className={styles.maskBtnWrapper}>
                  <Button className={styles.maskBtn} type="danger" onClick={this.restartPair}>
                    <div className={styles.maskBtnTextInfo}>
                      {intl.get('RESTART_PAIR_BTN_INFO')}
                    </div>
                    <div className={styles.maskBtnText}>{intl.get('RESTART_PAIR_BTN')}</div>
                  </Button>
                </div>
              </div>
            )}
          </SpinWrapper>
        </div>
      </Card>
    )
  }
}

export default TradePanel
