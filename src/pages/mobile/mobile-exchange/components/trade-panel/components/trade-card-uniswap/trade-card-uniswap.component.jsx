import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'

import { checkInputVal, getStrWithPrecision } from 'Utils'

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

import styles from './trade-card-uniswap.module.css'

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
      inputTop,
      availableTop,

      dataReady,

      changeFieldValue,
    } = this.props

    if (srcToken.tokenName === 'FOUSDT@eosio') {
      const tmpAmount = new BigNumber(availableTop || 0)

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
        } else if (tmpAmount.lt(inputTop)) {
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
      dstToken,
      srcToken,
      inputTop,
      inputTopFieldName,
      inputBottom,
      inputBottomFieldName,
      sliderValue,

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
        comfirmFuc(
          `${getStrWithPrecision(inputBottom, dstToken.pre)} ${dstToken.tokenName}`,
          `${getStrWithPrecision(inputTop, srcToken.pre)} ${srcToken.tokenName}`,
          sliderValue,
        )
      }
    })

    return true
  }

  reverseHold = () => {
    const { changeFieldValue } = this.props

    changeFieldValue('mobileCurrenTradeCard', 'lower_hold_of_buy')
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
      form: { getFieldDecorator },

      locked,
      uniswapPrice,
      mobileCurrenTradeCard,

      inputTop,
      inputTopPlaceholder,
      inputTopFieldName,
      inputTopDisabled,
      inputTopOnBlur,
      inputTopSuffix,
      inputTopReadOnly,
      inputTopTip,
      availableTop,
      availableTopSymbol,
      availableTopPre,

      inputBottom,
      inputBottomPlaceholder,
      inputBottomFieldName,
      inputBottomDisabled,
      inputBottomOnBlur,
      inputBottomSuffix,
      inputBottomReadOnly,
      inputBottomTip,
      availableBottom,
      availableBottomSymbol,
      availableBottomPre,

      withSlider,
      sliderDisabled,
      sliderValue,
      sliderValueFieldName,
      sliderOnChange,
      sliderOnAfterChange,
      sliderStyle,

      fee,
      btnText,
      btnStatus,
      buttonStyle,
      color,
      inputButtonLoading,

      ironmanData,
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
                  validateFirst: true,
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
                        if (availableTop && value && new BigNumber(availableTop).lt(value)) {
                          return callback('')
                          // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
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
                    disabled={inputTopDisabled}
                    placeholder={inputTopPlaceholder}
                    suffix={inputTopSuffix || ''}
                    onBlur={inputTopOnBlur}
                  />,
                )}
              </Form.Item>
            </Form>
          </div>
          <div className={styles.availableTopWrapper}>
            <div className={classnames(styles.availableTop, color)}>
              {`${intl.get('AVAILABLE')}: ${getStrWithPrecision(
                availableTop,
                availableTopPre,
              )} ${availableTopSymbol}`}
            </div>
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
                  validateFirst: true,
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
                        if (availableBottom && value && new BigNumber(availableBottom).lt(value)) {
                          return callback('')
                          // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
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
                    disabled={inputBottomDisabled || !availableTop}
                    placeholder={inputBottomPlaceholder}
                    onBlur={inputBottomOnBlur}
                    suffix={inputBottomSuffix || ''}
                  />,
                )}
              </Form.Item>
            </Form>
          </div>
          <div className={styles.availableBottomWrapper}>
            <div className={classnames(styles.availableBottom, color)}>
              {`${intl.get('AVAILABLE')}: ${getStrWithPrecision(
                availableBottom,
                availableBottomPre,
              )} ${availableBottomSymbol}`}
            </div>
          </div>
          <div
            className={classnames(styles.sliderWrapper, withSlider ? '' : styles.withOutSlider)}
            id={styles.sliderWrapper}>
            {withSlider && (
              <Form>
                <Form.Item>
                  {getFieldDecorator(sliderValueFieldName, {
                    initialValue: sliderValue,
                  })(
                    <Slider
                      className={classnames(styles.slider, sliderStyle)}
                      marks={{
                        0: {},
                        0.25: {},
                        0.5: {},
                        0.75: {},
                        1: {},
                      }}
                      min={0}
                      max={1}
                      step={0.0001}
                      disabled={sliderDisabled}
                      onChange={sliderOnChange}
                      onAfterChange={sliderOnAfterChange}
                      tipFormatter={(val) => {
                        if (val) {
                          const tmp = new BigNumber(val).times(100).toFixed(2, 1)

                          return `${tmp}%`
                        }

                        return '0%'
                      }}
                      getTooltipPopupContainer={() => document.getElementById(styles.sliderWrapper)}
                    />,
                  )}
                </Form.Item>
              </Form>
            )}
          </div>
          <div className={styles.feeWrapper}>
            <div className={classnames(styles.fee, color)}>{`${intl.get('FEE')}: ${fee}`}</div>
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
        {locked && ironmanData && mobileCurrenTradeCard === 'lower_hold_of_sell' && (
          <div className={styles.maskWrapper}>
            <div className={styles.maskContent} />
            <div className={styles.maskBtnWrapper}>
              <Button className={styles.maskBtn} type="danger" onClick={this.reverseHold}>
                <div className={styles.maskBtnTextInfo}>{intl.get('REVERSE_HOLD_INFO_1')}</div>
                <div className={styles.maskBtnText}>{intl.get('REVERSE_HOLD_INFO_2')}</div>
              </Button>
            </div>
          </div>
        )}
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
      dstToken,
      uniswapPrice,

      inputTop,
      inputTopFieldName,
      inputTopObjFieldName,

      inputBottom,
      inputBottomFieldName,
      inputBottomObjFieldName,

      sliderValue,
      sliderValueFieldName,

      availableTop,
      availableBottom,

      changeFieldValue,
    } = props

    if (Object.prototype.toString.call(changedValues.toChargeInputValueTop) === '[object String]') {
      const { toChargeInputValueTop } = changedValues
      const toChargeInputValueTopBigNumber = new BigNumber(toChargeInputValueTop)

      if (toChargeInputValueTop === inputTop) return

      changeFieldValue(inputTopFieldName, toChargeInputValueTop)

      if (checkInputVal(toChargeInputValueTop)) {
        const tmpInputBottom = toChargeInputValueTopBigNumber.div(uniswapPrice)
        const tmpInputBottomStr = getStrWithPrecision(tmpInputBottom, dstToken.pre)

        changeFieldValue(inputBottomFieldName, tmpInputBottomStr)
        changeFieldValue(inputBottomObjFieldName, {})
      } else {
        changeFieldValue(inputBottomFieldName, undefined)
        changeFieldValue(inputBottomObjFieldName, {})
      }
    }

    if (
      Object.prototype.toString.call(changedValues.toChargeInputValueBottom) === '[object String]'
    ) {
      const { toChargeInputValueBottom } = changedValues
      const toChargeInputValueBottomBigNumber = new BigNumber(toChargeInputValueBottom)

      if (toChargeInputValueBottom === inputBottom) return

      changeFieldValue(inputBottomFieldName, toChargeInputValueBottom)

      if (checkInputVal(toChargeInputValueBottom)) {
        const tmpInputTop = toChargeInputValueBottomBigNumber.times(uniswapPrice)
        const tmpInputTopStr = getStrWithPrecision(tmpInputTop, srcToken.pre)

        changeFieldValue(inputTopFieldName, tmpInputTopStr)
        changeFieldValue(inputTopObjFieldName, {})
      } else {
        changeFieldValue(inputTopFieldName, undefined)
        changeFieldValue(inputTopObjFieldName, {})
      }
    }

    if (Object.prototype.toString.call(changedValues.extractInputValueTop) === '[object String]') {
      const { extractInputValueTop } = changedValues
      const extractInputValueTopBigNumber = new BigNumber(extractInputValueTop)

      if (extractInputValueTop === inputTop) return

      changeFieldValue(inputTopFieldName, extractInputValueTop)

      if (uniswapPrice && checkInputVal(extractInputValueTop)) {
        const tmpInputBottom = extractInputValueTopBigNumber.div(uniswapPrice)
        const tmpInputBottomStr = getStrWithPrecision(tmpInputBottom, dstToken.pre)
        changeFieldValue(inputBottomFieldName, tmpInputBottomStr)
        changeFieldValue(inputBottomObjFieldName, {})

        const tmpSliderValue = extractInputValueTopBigNumber.div(availableTop)
        changeFieldValue(sliderValueFieldName, tmpSliderValue)
      } else {
        changeFieldValue(inputBottomFieldName, undefined)
        changeFieldValue(inputBottomObjFieldName, {})
        changeFieldValue(sliderValueFieldName, 0)
      }
    }

    if (
      Object.prototype.toString.call(changedValues.extractInputValueBottom) === '[object String]'
    ) {
      const { extractInputValueBottom } = changedValues
      const extractInputValueBottomBigNumber = new BigNumber(extractInputValueBottom)

      if (extractInputValueBottom === inputBottom) return

      changeFieldValue(inputBottomFieldName, extractInputValueBottom)

      if (uniswapPrice && checkInputVal(extractInputValueBottom)) {
        const tmpInputTop = extractInputValueBottomBigNumber.times(uniswapPrice)
        const tmpInputTopStr = getStrWithPrecision(tmpInputTop, srcToken.pre)
        changeFieldValue(inputTopFieldName, tmpInputTopStr)
        changeFieldValue(inputTopObjFieldName, {})

        const tmpSliderValue = extractInputValueBottomBigNumber.div(availableBottom)
        changeFieldValue(sliderValueFieldName, tmpSliderValue)
      } else {
        changeFieldValue(inputTopFieldName, undefined)
        changeFieldValue(inputTopObjFieldName, {})
        changeFieldValue(sliderValueFieldName, 0)
      }
    }

    if (Object.prototype.toString.call(changedValues.extractSliderValue) === '[object Number]') {
      const { extractSliderValue } = changedValues

      if (extractSliderValue === sliderValue || extractSliderValue > 1) return

      changeFieldValue(sliderValueFieldName, extractSliderValue)

      if (availableTop && availableBottom) {
        const tmpTop = getStrWithPrecision(
          new BigNumber(availableTop).times(extractSliderValue),
          srcToken.pre,
        )

        const tmpBottom = getStrWithPrecision(
          new BigNumber(availableBottom).times(extractSliderValue),
          dstToken.pre,
        )

        changeFieldValue(inputTopFieldName, tmpTop)
        changeFieldValue(inputTopObjFieldName, {})

        changeFieldValue(inputBottomFieldName, tmpBottom)
        changeFieldValue(inputBottomObjFieldName, {})
      }
    }
  },
  onFieldsChange: (props, changedValues /* , allFields */) => {
    const { inputTopObjFieldName, inputBottomObjFieldName, changeFieldValue } = props

    if (changedValues.toChargeInputValueTop) {
      const { dirty, errors, name, touched, validating } = changedValues.toChargeInputValueTop
      changeFieldValue(inputTopObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.toChargeInputValueBottom) {
      const { dirty, errors, name, touched, validating } = changedValues.toChargeInputValueBottom
      changeFieldValue(inputBottomObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.extractInputValueTop) {
      const { dirty, errors, name, touched, validating } = changedValues.extractInputValueTop
      changeFieldValue(inputTopObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.extractInputValueBottom) {
      const { dirty, errors, name, touched, validating } = changedValues.extractInputValueBottom
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
      [props.sliderValueFieldName]: Form.createFormField({
        value: props.sliderValue,
      }),
    }
  },
})(TradeCard)

export default withRouter(TradeCardForm)
