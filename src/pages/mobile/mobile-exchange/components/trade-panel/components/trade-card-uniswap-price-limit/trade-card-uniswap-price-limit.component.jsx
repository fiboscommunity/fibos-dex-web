import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'

import { getStrWithPrecision } from 'Utils'

import Tooltip from 'antd/lib/tooltip'
import 'antd/lib/tooltip/style/css'
import Slider from 'antd/lib/slider'
import 'antd/lib/slider/style/css'
import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'
import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'

import FeeTip from '../fee-tip'
import styles from './trade-card-uniswap-price-limit.module.css'

class TradeCard extends PureComponent {
  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  checkCoinStatus = () => {
    const {
      srcToken,
      tradeQunitity,
      available,

      dataReady,

      changeFieldValue,
    } = this.props

    if (srcToken.tokenName === 'FOUSDT@eosio') {
      const tmpAmount = new BigNumber(available || 0)

      if (window.fowallet && dataReady) {
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
          changeFieldValue('showTradePanel', false)
          Modal.confirm({
            title: intl.get('FOUSDT_EQUAL_ZERO'),
            content: intl.get('FOUSDT_EQUAL_ZERO_DES'),
            okText: intl.get('YES'),
            cancelText: intl.get('NO'),
            onOk: dappHrefFuc,
          })
        } else if (tmpAmount.lt(tradeQunitity)) {
          changeFieldValue('showTradePanel', false)
          Modal.confirm({
            title: intl.get('FOUSDT_NOT_ENOUGH'),
            content: intl.get('FOUSDT_NOT_ENOUGH_DES'),
            okText: intl.get('YES'),
            cancelText: intl.get('NO'),
            onOk: dappHrefFuc,
          })
        }
      }
    }
  }

  handleComfirm = () => {
    const {
      inputTop,
      inputTopFieldName,
      inputBottom,
      inputBottomFieldName,

      btnStatus,

      comfirmFuc,
      form: { validateFields },
      toLogin,
    } = this.props

    if (btnStatus) {
      return toLogin()
    }

    this.checkCoinStatus()

    validateFields([inputTopFieldName, inputBottomFieldName], (errors, value) => {
      if (!errors && value[inputTopFieldName] && value[inputBottomFieldName]) {
        comfirmFuc(inputTop, inputBottom)
      }
    })

    return true
  }

  restartPair = () => {
    const { match, dstToken, srcToken } = this.props

    if (srcToken.tokenName && srcToken.tokenName) {
      const tmpSearch = queryString.stringify({
        x: dstToken.tokenName,
        y: srcToken.tokenName,
      })

      this._goto(
        match.path.indexOf('/app') >= 0 ? '/app/reactivationpair' : '/mobile/reactivationpair',
        tmpSearch,
      )
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, validateFields },
      srcToken,

      available,
      availableSymbol,
      availablePre,
      availableValidateType,

      uniswapPrice,

      inputTop,
      inputTopPlaceholder,
      inputTopFieldName,
      inputTopDisabled,
      inputTopOnChange,
      inputTopOnBlur,
      inputTopSuffix,
      inputTopReadOnly,
      inputTopTip,

      inputBottom,
      inputBottomPlaceholder,
      inputBottomFieldName,
      inputBottomDisabled,
      inputBottomOnChange,
      inputBottomOnBlur,
      inputBottomSuffix,
      inputBottomReadOnly,
      inputBottomTip,
      tradeQunitity,
      tradeQunititySymbol,

      withSlider,
      sliderValue,
      sliderFieldName,
      sliderStep,
      sliderOnChange,
      sliderDisabled,
      sliderStyle,

      fee,
      btnText,
      btnStatus,
      buttonStyle,
      color,
      inputButtonLoading,
    } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div
            className={classnames(
              styles.inputTopWrapper,
              inputTopTip === 'right' ? styles.tipRight : styles.tipLeft,
            )}>
            <Form>
              <Form.Item>
                {getFieldDecorator(inputTopFieldName, {
                  initialValue: inputTop,
                  // validateFirst: true,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (!value || Number.isNaN(Number(value))) {
                          return callback('')
                          // return callback(intl.get('TRADE_PANEL_INFO2'))
                        }

                        return callback()
                      },
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (value && new BigNumber(value).lte(0)) {
                          return callback('')
                          // return callback(intl.get('TRADE_PANEL_INFO3'))
                        }

                        return callback()
                      },
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (availableValidateType === 'times') {
                          const tmpBottom = new BigNumber(getFieldValue(inputBottomFieldName))

                          if (tmpBottom && available && tmpBottom.times(value).gt(available)) {
                            return callback('')
                            // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
                          }
                        }

                        return callback()
                      },
                    },
                  ],
                })(
                  <Input
                    className={styles.inputTop}
                    autoComplete="off"
                    readOnly={inputTopReadOnly === 'yes'}
                    placeholder={inputTopPlaceholder}
                    disabled={inputTopDisabled}
                    suffix={inputTopSuffix || ''}
                    onChange={inputTopOnChange}
                    onBlur={inputTopOnBlur}
                  />,
                )}
              </Form.Item>
            </Form>
          </div>
          <div
            className={classnames(
              styles.inputBottomWrapper,
              inputBottomTip === 'right' ? styles.tipRight : styles.tipLeft,
            )}>
            <Form>
              <Form.Item>
                {getFieldDecorator(inputBottomFieldName, {
                  initialValue: inputBottom,
                  // validateFirst: true,
                  validateTrigger: ['onChange', 'onBlur'],
                  rules: [
                    {
                      validator: (rule, value, callback) => {
                        if (!value || Number.isNaN(Number(value))) {
                          return callback('')
                          // return callback(intl.get('TRADE_PANEL_INFO2'))
                        }

                        return callback()
                      },
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (value && new BigNumber(value).lte(0)) {
                          return callback('')
                          // return callback(intl.get('TRADE_PANEL_INFO3'))
                        }

                        return callback()
                      },
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (availableValidateType === 'times') {
                          const tmpTop = new BigNumber(getFieldValue(inputTopFieldName))

                          if (tmpTop && available && tmpTop.times(value).gt(available)) {
                            return callback('')
                            // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
                          }
                        }

                        if (availableValidateType === 'inputBottom') {
                          const tmpBottom = new BigNumber(value)

                          if (tmpBottom && available && tmpBottom.gt(available)) {
                            return callback('')
                            // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
                          }
                        }

                        return callback()
                      },
                    },
                  ],
                })(
                  <Input
                    className={styles.inputBottom}
                    autoComplete="off"
                    readOnly={inputBottomReadOnly === 'yes'}
                    disabled={inputBottomDisabled || !available}
                    placeholder={inputBottomPlaceholder}
                    onChange={inputBottomOnChange}
                    onBlur={inputBottomOnBlur}
                    suffix={inputBottomSuffix || ''}
                  />,
                )}
              </Form.Item>
            </Form>
          </div>
          <div className={styles.availableWrapper}>
            <div className={classnames(styles.available, color)}>
              {`${intl.get('AVAILABLE')}: ${getStrWithPrecision(
                available,
                availablePre,
              )} ${availableSymbol}`}
            </div>
          </div>
          <div
            className={classnames(styles.sliderWrapper, withSlider ? '' : styles.withOutSlider)}
            id={styles.sliderWrapper}>
            {withSlider && (
              <Form.Item>
                <Form.Item>
                  {getFieldDecorator(sliderFieldName, {
                    initialValue: sliderValue,
                    validateTrigger: ['onChange'],
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          validateFields([inputTopFieldName, inputBottomFieldName])

                          return callback()
                        },
                      },
                    ],
                  })(
                    <Slider
                      className={classnames(styles.slider, sliderStyle)}
                      max={1000000}
                      sliderStep={sliderStep}
                      marks={{
                        0: {},
                        250000: {},
                        500000: {},
                        750000: {},
                        1000000: {},
                      }}
                      disabled={sliderDisabled}
                      onChange={sliderOnChange}
                      tipFormatter={(val) => {
                        if (val && available) {
                          const tmp = new BigNumber(val).div(10000).toFixed(2, 1)

                          return `${tmp}%`
                        }

                        return '0%'
                      }}
                      getTooltipPopupContainer={() => document.getElementById(styles.sliderWrapper)}
                    />,
                  )}
                </Form.Item>
              </Form.Item>
            )}
          </div>
          <div className={styles.tradeQunitityWrapper}>
            <div className={styles.tradeQunitity}>
              {`${intl.get('TRADE_QUNITITY')}: ${getStrWithPrecision(
                tradeQunitity,
                srcToken.pre,
              )} ${tradeQunititySymbol}`}
            </div>
          </div>
          <div className={styles.feeWrapper}>
            <div className={classnames(styles.fee, color)}>{`${intl.get('FEE')}: ${fee}`}</div>
            <FeeTip />
          </div>
          <div className={styles.btnWrapper}>
            <Tooltip title={btnStatus ? intl.get('NO_EXTENSION') : ''}>
              <Button
                loading={inputButtonLoading}
                className={
                  btnStatus
                    ? classnames(styles.btn, buttonStyle, styles.disabled)
                    : classnames(styles.btn, buttonStyle)
                }
                onClick={this.handleComfirm}>
                <div className={styles.btnText}>{btnText}</div>
              </Button>
            </Tooltip>
          </div>
        </div>
        {new BigNumber(uniswapPrice).lte(0) && (
          <div className={styles.maskWrapper}>
            <div className={styles.maskContent} />
            <div className={styles.maskBtnWrapper}>
              <Button className={styles.maskBtn} type="danger" onClick={this.restartPair}>
                <div className={styles.maskBtnTextInfo}>{intl.get('RESTART_PAIR_BTN_INFO')}</div>
                <div className={styles.maskBtnText}>{intl.get('RESTART_PAIR_BTN')}</div>
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const TradeCardForm = Form.create({
  name: 'tradeCardLowerHold',
  onValuesChange: (props, changedValues /* , allValues */) => {
    const {
      srcToken,

      inputTop,
      inputTopFieldName,
      inputBottom,
      inputBottomFieldName,

      tradeQunitityFieldName,

      sliderFieldName,

      changeFieldValue,
      form: { validateFields },
    } = props

    if (Object.prototype.toString.call(changedValues.priceLimitBuyPrice) === '[object String]') {
      const { priceLimitBuyPrice } = changedValues

      changeFieldValue(inputTopFieldName, priceLimitBuyPrice)

      const priceLimitBuyPriceBigNumber = new BigNumber(priceLimitBuyPrice)
      const inputBottomBigNumber = new BigNumber(inputBottom)
      if (
        !priceLimitBuyPrice ||
        priceLimitBuyPriceBigNumber.lte(0) ||
        !inputBottom ||
        inputBottomBigNumber.lte(0) ||
        Number.isNaN(Number(priceLimitBuyPrice)) ||
        Number.isNaN(Number(inputBottom))
      ) {
        changeFieldValue(tradeQunitityFieldName, undefined)
      } else {
        const tmpQunitityBuyPrice = priceLimitBuyPriceBigNumber.times(inputBottom)

        changeFieldValue(
          tradeQunitityFieldName,
          getStrWithPrecision(tmpQunitityBuyPrice, srcToken.pre),
        )
      }

      validateFields([inputTopFieldName, inputBottomFieldName])
    }

    if (Object.prototype.toString.call(changedValues.priceLimitBuyAmount) === '[object String]') {
      const { priceLimitBuyAmount } = changedValues

      changeFieldValue(inputBottomFieldName, priceLimitBuyAmount)

      const priceLimitBuyAmountBigNumber = new BigNumber(priceLimitBuyAmount)
      const inputTopBigNumber = new BigNumber(inputTop)
      if (
        !priceLimitBuyAmount ||
        priceLimitBuyAmountBigNumber.lte(0) ||
        !inputTop ||
        inputTopBigNumber.lte(0) ||
        Number.isNaN(Number(priceLimitBuyAmount)) ||
        Number.isNaN(Number(inputTop))
      ) {
        changeFieldValue(tradeQunitityFieldName, undefined)
      } else {
        const tmpQunitityBuyAmount = priceLimitBuyAmountBigNumber.times(inputTop)

        changeFieldValue(
          tradeQunitityFieldName,
          getStrWithPrecision(tmpQunitityBuyAmount, srcToken.pre),
        )
      }

      validateFields([inputTopFieldName, inputBottomFieldName])
    }

    if (
      Object.prototype.toString.call(changedValues.priceLimitBuySliderValue) === '[object Number]'
    ) {
      const { priceLimitBuySliderValue } = changedValues

      if (priceLimitBuySliderValue > 1000000) return
      changeFieldValue(sliderFieldName, priceLimitBuySliderValue)
      // const tmpSlider = new BigNumber(priceLimitBuySliderValue)
      // changeFieldValue(inputBottomFieldName, getStrWithPrecision(tmpSlider, dstToken.pre))
      // changeFieldValue(inputBottomObjFieldName, {})

      // const { priceLimitBuyPrice } = allValues
      // const priceLimitBuyPriceBigNumber = new BigNumber(priceLimitBuyPrice)

      // if (available > 0 && priceLimitBuyPrice && priceLimitBuyPriceBigNumber.gt(0)) {
      //   const tmpTotal = tmpSlider.times(priceLimitBuyPriceBigNumber)

      //   changeFieldValue(tradeQunitityFieldName, getStrWithPrecision(tmpTotal, srcToken.pre))
      // }

      validateFields([inputTopFieldName, inputBottomFieldName])
    }

    if (Object.prototype.toString.call(changedValues.priceLimitSellPrice) === '[object String]') {
      const { priceLimitSellPrice } = changedValues

      changeFieldValue(inputTopFieldName, priceLimitSellPrice)

      const priceLimitSellPriceBigNumber = new BigNumber(priceLimitSellPrice)
      const inputBottomBigNumber = new BigNumber(inputBottom)
      if (
        !priceLimitSellPrice ||
        priceLimitSellPriceBigNumber.lte(0) ||
        !inputBottom ||
        inputBottomBigNumber.lte(0) ||
        Number.isNaN(Number(priceLimitSellPrice)) ||
        Number.isNaN(Number(inputBottom))
      ) {
        changeFieldValue(tradeQunitityFieldName, undefined)
      } else {
        const tmpQunititySellPrice = priceLimitSellPriceBigNumber.times(inputBottom)

        changeFieldValue(
          tradeQunitityFieldName,
          getStrWithPrecision(tmpQunititySellPrice, srcToken.pre),
        )

        validateFields([inputTopFieldName, inputBottomFieldName])
      }
    }

    if (Object.prototype.toString.call(changedValues.priceLimitSellAmount) === '[object String]') {
      const { priceLimitSellAmount } = changedValues

      changeFieldValue(inputBottomFieldName, priceLimitSellAmount)

      const priceLimitSellAmountBigNumber = new BigNumber(priceLimitSellAmount)
      const inputTopBigNumber = new BigNumber(inputTop)
      if (
        !priceLimitSellAmount ||
        priceLimitSellAmountBigNumber.lte(0) ||
        !inputTop ||
        inputTopBigNumber.lte(0) ||
        Number.isNaN(Number(priceLimitSellAmount)) ||
        Number.isNaN(Number(inputTop))
      ) {
        changeFieldValue(tradeQunitityFieldName, undefined)
      } else {
        const tmpQunititySellAmount = priceLimitSellAmountBigNumber.times(inputTop)

        changeFieldValue(
          tradeQunitityFieldName,
          getStrWithPrecision(tmpQunititySellAmount, srcToken.pre),
        )

        validateFields([inputTopFieldName, inputBottomFieldName])
      }
    }

    if (
      Object.prototype.toString.call(changedValues.priceLimitSellSliderValue) === '[object Number]'
    ) {
      const { priceLimitSellSliderValue } = changedValues

      if (priceLimitSellSliderValue > 1000000) return
      changeFieldValue(sliderFieldName, priceLimitSellSliderValue)
    }
  },
  onFieldsChange: (props, changedValues /* , allFields */) => {
    const {
      inputTopObjFieldName,
      inputBottomObjFieldName,

      changeFieldValue,
    } = props

    if (changedValues.priceLimitBuyPrice) {
      const { dirty, errors, name, touched, validating } = changedValues.priceLimitBuyPrice
      changeFieldValue(inputTopObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.priceLimitBuyAmount) {
      const { dirty, errors, name, touched, validating } = changedValues.priceLimitBuyAmount
      changeFieldValue(inputBottomObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.priceLimitSellPrice) {
      const { dirty, errors, name, touched, validating } = changedValues.priceLimitSellPrice
      changeFieldValue(inputTopObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.priceLimitSellAmount) {
      const { dirty, errors, name, touched, validating } = changedValues.priceLimitSellAmount
      changeFieldValue(inputBottomObjFieldName, { dirty, errors, name, touched, validating })
    }
  },
  mapPropsToFields(props) {
    return {
      [props.inputTopFieldName]: Form.createFormField({
        value: props.inputTop,
        ...props.inputTopObj,
      }),
      [props.inputBottomFieldName]: Form.createFormField({
        value: props.inputBottom,
        ...props.inputBottomObj,
      }),
      [props.sliderFieldName]: Form.createFormField({
        value: props.sliderValue,
      }),
    }
  },
})(TradeCard)

export default withRouter(TradeCardForm)
