/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import { BigNumber } from 'bignumber.js'

import Tooltip from 'antd/lib/tooltip'
import 'antd/lib/tooltip/style/css'

import { SpinWrapper } from 'Components'
import { pollInterval, colorMap } from 'Config'
import { getPrecision, getStrWithPrecision } from 'Utils'

import onlySell from 'Assets/exchange/onlySell.png'
import onlySellHover from 'Assets/exchange/onlySellHover.png'
import sellAndBuy from 'Assets/exchange/sellAndBuy.png'
import sellAndBuyHover from 'Assets/exchange/sellAndBuyHover.png'
import onlyBuy from 'Assets/exchange/onlyBuy.png'
import onlyBuyHover from 'Assets/exchange/onlyBuyHover.png'

import Card from '../card'
import styles from './handicap.module.css'

class Handicap extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { srcToken, dstToken, changeFieldValue } = this.props

    if (srcToken && srcToken.tokenName && dstToken && dstToken.tokenName) {
      changeFieldValue('spinningHandicap', true)
      this.getHandicapData(srcToken, dstToken)
    }
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { srcToken, dstToken, changeFieldValue } = this.props
    if (
      dstToken.tokenName &&
      srcToken.tokenName &&
      (prevProps.dstToken.tokenName !== dstToken.tokenName ||
        prevProps.srcToken.tokenName !== srcToken.tokenName)
    ) {
      changeFieldValue('spinningHandicap', true)
      this.getHandicapData(srcToken, dstToken)
    }

    const { requestingHandicap } = this.props

    if (!requestingHandicap && requestingHandicap !== prevProps.requestingHandicap) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  getHandicapData = (srcToken, dstToken) => {
    const { getHandicapData, changeFieldValue } = this.props

    changeFieldValue('requestingHandicap', true)
    getHandicapData(
      {
        tokenx: dstToken.tokenName,
        tokeny: srcToken.tokenName,
        limit: 24,
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

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { srcToken, dstToken } = this.props

      this.getHandicapData(srcToken, dstToken)
    }, pollInterval)

    return true
  }

  render() {
    const {
      handicapType,
      handicapData,
      handicapAmountMax,
      spinningHandicap,

      changeFieldValue,
      setPricesOfPriceLimit,
    } = this.props

    const addon = (
      <div className={styles.titleWrapper}>
        <div className={styles.titleHead}>{intl.get('PRICE')}</div>
        <div className={styles.titleBody}>{intl.get('AMOUNT')}</div>
        <div className={styles.titleTail}>{intl.get('ADDED')}</div>
      </div>
    )

    // const tmpTip = (
    //   <div className={styles.tipRow}>
    //     <div className={classnames(styles.rowPrice, styles[item.type])}>
    //       {`${intl.get('PRICE')}: ${item.price}`}
    //     </div>
    //     <div className={styles.rowAmount}>
    //       {`${intl.get('AMOUNT')}: ${item.sum_quantity}`}
    //     </div>
    //     <div className={styles.rowAdded}>
    //       {`${intl.get('ADDED')}: ${item.totalamount}`}
    //     </div>
    //   </div>
    // )

    return (
      <Card className={styles.wrapper} title={intl.get('HANDICAP')} addon={addon} height={76}>
        <SpinWrapper spinning={spinningHandicap}>
          <div className={styles.contentWrapper}>
            <div className={classnames(styles.content, styles[handicapType])}>
              {handicapData.map(item => {
                const { lastprice, price, type, id } = item
                const sumQuantity = item.sum_quantity

                if (lastprice) {
                  return (
                    <div className={styles.contentRow} key={`${lastprice}_${id}`}>
                      <div
                        className={classnames(styles.lastPrice, styles.buy)}
                        onClick={() => {
                          setPricesOfPriceLimit(type, lastprice)
                        }}>
                        {lastprice}
                      </div>
                    </div>
                  )
                }

                const tmpHasColorBg = handicapData.length > 0 && sumQuantity > 0
                let tmpColorRate = 0
                if (tmpHasColorBg) {
                  tmpColorRate = new BigNumber(sumQuantity)
                    .div(handicapAmountMax[type])
                    .times(100)
                    .toFixed(2, 1)
                }

                const tmpPre = getPrecision(price)
                const tmpTotalPrice = getStrWithPrecision(
                  new BigNumber(price).times(sumQuantity),
                  tmpPre,
                )

                return (
                  <div
                    className={styles.contentRow}
                    key={price}
                    onClick={() => {
                      setPricesOfPriceLimit(type, price)
                    }}>
                    <div
                      className={styles.rowColorBg}
                      style={
                        tmpHasColorBg
                          ? { width: `${tmpColorRate}%`, backgroundColor: colorMap[type] }
                          : {}
                      }
                    />
                    <div className={classnames(styles.rowPrice, styles[type])}>{price}</div>
                    <div className={styles.rowAmount}>{sumQuantity}</div>
                    <div className={styles.rowAdded}>{tmpTotalPrice}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </SpinWrapper>
        <div className={styles.typeRow}>
          <div className={styles.type}>
            {handicapType !== 'sellAndBuy' && (
              <Tooltip title={intl.get('SELLANDBUY')}>
                <img
                  className={styles.typeImg}
                  src={sellAndBuy}
                  alt=""
                  onClick={() => {
                    changeFieldValue('handicapType', 'sellAndBuy')
                    return true
                  }}
                />
              </Tooltip>
            )}
            {handicapType === 'sellAndBuy' && (
              <Tooltip title={intl.get('SELLANDBUY')}>
                <img className={styles.typeImg} src={sellAndBuyHover} alt="" />
              </Tooltip>
            )}
          </div>
          <div className={styles.type}>
            {handicapType !== 'onlyBuy' && (
              <Tooltip title={intl.get('ONLYBUY')}>
                <img
                  className={styles.typeImg}
                  src={onlyBuy}
                  alt=""
                  onClick={() => {
                    changeFieldValue('handicapType', 'onlyBuy')
                    return true
                  }}
                />
              </Tooltip>
            )}
            {handicapType === 'onlyBuy' && (
              <Tooltip title={intl.get('ONLYBUY')}>
                <img className={styles.typeImg} src={onlyBuyHover} alt="" />
              </Tooltip>
            )}
          </div>
          <div className={styles.type}>
            {handicapType !== 'onlySell' && (
              <Tooltip title={intl.get('ONLYSELL')}>
                <img
                  className={styles.typeImg}
                  src={onlySell}
                  alt=""
                  onClick={() => {
                    changeFieldValue('handicapType', 'onlySell')
                    return true
                  }}
                />
              </Tooltip>
            )}
            {handicapType === 'onlySell' && (
              <Tooltip title={intl.get('ONLYSELL')}>
                <img className={styles.typeImg} src={onlySellHover} alt="" />
              </Tooltip>
            )}
          </div>
        </div>
      </Card>
    )
  }
}

export default Handicap
