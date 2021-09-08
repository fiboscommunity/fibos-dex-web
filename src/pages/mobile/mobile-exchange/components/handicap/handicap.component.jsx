/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { PureComponent } from 'react'
import classnames from 'classnames'
import intl from 'react-intl-universal'
import { BigNumber } from 'bignumber.js'

import { SpinWrapper } from 'Components'
import { pollInterval, colorMap } from 'Config'

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

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { srcToken, dstToken } = this.props

      this.getHandicapData(srcToken, dstToken)
    }, pollInterval)

    return true
  }

  render() {
    const {
      handicapData,
      handicapAmountMax,
      spinningHandicap,

      setPricesOfPriceLimit,
    } = this.props

    const tmpSellData = []
    const tmpBuyData = []

    handicapData.forEach(item => {
      if (item.type === 'sell') tmpSellData.push({ ...item })
      if (item.type === 'buy') tmpBuyData.push({ ...item })
    })

    return (
      <SpinWrapper spinning={spinningHandicap}>
        <div className={styles.contentWrapper}>
          {tmpSellData && tmpSellData.length > 0 && (
            <div className={styles.titleWrapper}>
              <div className={styles.titleHead}>
                <em className={styles.buy}>{intl.get('SINGLE_BUY')}</em>
                {intl.get('AMOUNT')}
              </div>
              <div className={styles.titleBody}>{intl.get('PRICE')}</div>
              <div className={styles.titleFooter}>
                {intl.get('AMOUNT')}
                <em className={styles.sell}>{intl.get('SINGLE_SELL')}</em>
              </div>
            </div>
          )}
          <div className={styles.bodyWrapper}>
            <div className={styles.buyContent}>
              {tmpBuyData.map(item => {
                const tmpHasColorBg = tmpBuyData.length > 0 && item.sum_quantity > 0
                let tmpColorRate = 0
                if (tmpHasColorBg) {
                  tmpColorRate = new BigNumber(item.sum_quantity)
                    .div(handicapAmountMax[item.type])
                    .times(100)
                    .toFixed(2, 1)
                }

                return (
                  <div
                    className={styles.contentRow}
                    key={item.price}
                    onClick={() => {
                      setPricesOfPriceLimit(item.type, item.price)
                    }}>
                    <div
                      className={styles.rowColorBg}
                      style={
                        tmpHasColorBg
                          ? { width: `${tmpColorRate}%`, backgroundColor: colorMap[item.type] }
                          : {}
                      }
                    />
                    <div className={styles.rowAmount}>{item.sum_quantity}</div>
                    <div className={classnames(styles.rowPrice, styles[item.type])}>
                      {item.price}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.sellContent}>
              {tmpSellData.map(item => {
                const tmpHasColorBg = tmpSellData.length > 0 && item.sum_quantity > 0
                let tmpColorRate = 0
                if (tmpHasColorBg) {
                  tmpColorRate = new BigNumber(item.sum_quantity)
                    .div(handicapAmountMax[item.type])
                    .times(100)
                    .toFixed(2, 1)
                }

                return (
                  <div
                    className={styles.contentRow}
                    key={item.price}
                    onClick={() => {
                      setPricesOfPriceLimit(item.type, item.price)
                    }}>
                    <div
                      className={styles.rowColorBg}
                      style={
                        tmpHasColorBg
                          ? { width: `${tmpColorRate}%`, backgroundColor: colorMap[item.type] }
                          : {}
                      }
                    />
                    <div className={styles.rowAmount}>{item.sum_quantity}</div>
                    <div className={classnames(styles.rowPrice, styles[item.type])}>
                      {item.price}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </SpinWrapper>
    )
  }
}

export default Handicap
