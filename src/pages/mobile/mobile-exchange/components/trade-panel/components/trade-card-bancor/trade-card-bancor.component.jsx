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
import styles from './trade-card-bancor.module.css'

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
      tokenCost,
      inputBottom,
      available,

      dataReady,

      changeFieldValue,
    } = this.props

    if (tokenCost.tokenName === 'FOUSDT@eosio') {
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
        } else if (tmpAmount.lt(inputBottom)) {
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
      tokenCost,
      tokenGet,
      inputBottom,
      inputBottomFieldName,
      beforeValidate,
      comfirmFuc,
      form,

      btnStatus,
      available,

      toLogin,
    } = this.props

    if (btnStatus || !available) {
      return toLogin()
    }

    this.checkCoinStatus(this.props)

    const { validateFields } = form

    if (beforeValidate()) {
      validateFields([inputBottomFieldName], (errors, value) => {
        if (!errors && value[inputBottomFieldName]) {
          comfirmFuc(
            `${getStrWithPrecision(inputBottom, tokenCost.pre)} ${tokenCost.tokenName}`,
            `${getStrWithPrecision(0, tokenGet.pre)} ${tokenGet.tokenName}`,
          )
        }
      })
    }

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
      form,

      uniswapPrice,
      tokenCost,
      available,
      inputTop,
      inputTopDisabled,
      inputTopSuffix,
      inputBottomPlaceholder,
      inputBottom,
      inputBottomFieldName,
      inputBottomDisabled,
      inputBottomOnBlur,
      inputBottomSuffix,
      inputBottomTip,
      withSlider,
      sliderValue,
      sliderFieldName,
      sliderOnChange,
      sliderStep,
      sliderOnAfterChange,
      sliderStyle,
      fee,
      btnText,
      btnStatus,
      buttonStyle,
      color,
      inputButtonLoading,
    } = this.props
    const { getFieldDecorator } = form

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.inputTopWrapper}>
            <Input
              className={styles.inputTop}
              autoComplete="off"
              value={inputTop}
              disabled={inputTopDisabled}
              type="text"
              suffix={inputTopSuffix || ''}
            />
          </div>
          {/* <div className={styles.titleBottomWrapper}>
            <div className={styles.titleBottom}>{titleBottom}</div>
          </div> */}
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
                        if (available && value && new BigNumber(available).lt(value)) {
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
                    disabled={inputBottomDisabled || !available}
                    placeholder={inputBottomPlaceholder}
                    onBlur={inputBottomOnBlur}
                    suffix={inputBottomSuffix || ''}
                  />,
                )}
              </Form.Item>
            </Form>
          </div>
          <div className={styles.availableWrapper}>
            <div className={classnames(styles.available, color)}>
              {`${intl.get('AVAILABLE')}: ${getStrWithPrecision(available, tokenCost.pre)} ${
                tokenCost.symbol
              }`}
            </div>
          </div>
          {withSlider && (
            <div className={styles.sliderWrapper} id={styles.sliderWrapper}>
              <Form.Item>
                <Form.Item>
                  {getFieldDecorator(sliderFieldName, {
                    initialValue: sliderValue,
                  })(
                    <Slider
                      className={classnames(styles.slider, sliderStyle)}
                      max={1}
                      step={sliderStep}
                      marks={{
                        0: {},
                        0.25: {},
                        0.5: {},
                        0.75: {},
                        1: {},
                      }}
                      disabled={available === 0}
                      onChange={sliderOnChange}
                      onAfterChange={sliderOnAfterChange}
                      tipFormatter={(val) => {
                        if (val && available) {
                          return `${new BigNumber(val).times(100).toFixed(2, 1)}%`
                        }

                        return '0%'
                      }}
                      getTooltipPopupContainer={() => document.getElementById(styles.sliderWrapper)}
                    />,
                  )}
                </Form.Item>
              </Form.Item>
            </div>
          )}
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
        {/* TODO attention should be double checked & solved here */}
        {false && new BigNumber(uniswapPrice).lte(0) && (
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
  name: 'tradeCardBancor',
  onValuesChange: (props, changedValues /* , allValues */) => {
    const { inputBottom, inputBottomFieldName, sliderFieldName, changeFieldValue } = props

    if (Object.prototype.toString.call(changedValues.toBuyInputValueBottom) === '[object String]') {
      const { toBuyInputValueBottom } = changedValues

      if (toBuyInputValueBottom === inputBottom) return
      changeFieldValue(inputBottomFieldName, toBuyInputValueBottom)
    }

    if (
      Object.prototype.toString.call(changedValues.toSellInputValueBottom) === '[object String]'
    ) {
      const { toSellInputValueBottom } = changedValues

      if (toSellInputValueBottom === inputBottom) return
      changeFieldValue(inputBottomFieldName, toSellInputValueBottom)
    }

    if (Object.prototype.toString.call(changedValues.toBuySliderValue) === '[object Number]') {
      const { toBuySliderValue } = changedValues

      if (toBuySliderValue > 1) return
      changeFieldValue(sliderFieldName, toBuySliderValue)
    }

    if (Object.prototype.toString.call(changedValues.toSellSliderValue) === '[object Number]') {
      const { toSellSliderValue } = changedValues

      if (toSellSliderValue > 1) return
      changeFieldValue(sliderFieldName, toSellSliderValue)
    }
  },
  onFieldsChange: (props, changedValues /* , allFields */) => {
    const { inputBottomObjFieldName, changeFieldValue } = props

    if (changedValues.toBuyInputValueBottom) {
      const { dirty, errors, name, touched, validating } = changedValues.toBuyInputValueBottom
      changeFieldValue(inputBottomObjFieldName, { dirty, errors, name, touched, validating })
    }

    if (changedValues.toSellInputValueBottom) {
      const { dirty, errors, name, touched, validating } = changedValues.toSellInputValueBottom
      changeFieldValue(inputBottomObjFieldName, { dirty, errors, name, touched, validating })
    }
  },
  mapPropsToFields(props) {
    return {
      [props.inputTopFieldName]: Form.createFormField({
        value: props.inputTop,
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
