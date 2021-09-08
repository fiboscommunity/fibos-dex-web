import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import classnames from 'classnames'
import BigNumber from 'bignumber.js'

import Icon from 'antd/lib/icon'

import { getStrWithPrecision } from 'Utils'
import { SpinWrapper } from 'Components'

import styles from './ticker.module.css'

export default class Ticker extends PureComponent {
  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  getLatestPrice = () => {
    const { lastPrice } = this.props

    if (lastPrice) {
      const { oneDayKdata, pricePre } = this.props
      const { oprice, nprice } = oneDayKdata
      let dayChangeNumber = new BigNumber(NaN)

      if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
        dayChangeNumber = new BigNumber(nprice).minus(oprice)
      }

      const dayRateDrection =
        !dayChangeNumber.isNaN() && dayChangeNumber.isNegative() ? 'down' : 'up'

      return (
        <div className={styles.latestPriceWrapper}>
          <div
            className={classnames(
              styles.price,
              dayRateDrection === 'up' ? styles.colorUp : styles.colorDown,
            )}>
            {lastPrice ? `${getStrWithPrecision(lastPrice, pricePre)}` : '--'}
          </div>
          {dayRateDrection === 'up' ? (
            <div className={classnames(styles.priceSymbol, styles.colorUp)}>
              <Icon type="arrow-up" />
            </div>
          ) : (
            <div className={classnames(styles.priceSymbol, styles.colorDown)}>
              <Icon type="arrow-down" />
            </div>
          )}
        </div>
      )
    }

    return null
  }

  getDayChange = () => {
    const { oneDayKdata } = this.props
    const { oprice, nprice } = oneDayKdata
    let dayChangeNumber = new BigNumber(NaN)

    if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
      dayChangeNumber = new BigNumber(nprice).minus(oprice)
    }

    if (!dayChangeNumber.isNaN()) {
      const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
      const dayRate = dayChangeNumber
        .div(new BigNumber(oprice))
        .times(100)
        .abs()
        .toFixed(2, 1)

      return (
        <div
          className={classnames(
            styles.dayChangeRate,
            dayRateDrection === 'up' ? styles.colorUp : styles.colorDown,
          )}>
          {dayRateDrection && dayRate
            ? `${dayRateDrection === 'up' ? '+' : '-'}${dayRate}%`
            : '+--%'}
        </div>
      )
    }

    return null
  }

  render() {
    const { oneDayKdata, spinning, pre, pricePre } = this.props
    const { hprice, lprice, quantitys } = oneDayKdata

    return (
      <SpinWrapper spinning={spinning}>
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelContent}>
                <div className={styles.panelRow}>{this.getLatestPrice()}</div>
                <div className={styles.dayChangeRate}>{this.getDayChange()}</div>
              </div>
            </div>
            <div className={styles.rightPanel}>
              <div className={styles.panelRow}>
                <div className={styles.label}>{intl.get('HIGH')}</div>
                <div className={styles.value}>
                  {hprice ? getStrWithPrecision(hprice, pricePre) : '--'}
                </div>
              </div>
              <div className={styles.panelRow}>
                <div className={styles.label}>{intl.get('LOW')}</div>
                <div className={styles.value}>
                  {lprice ? getStrWithPrecision(lprice, pricePre) : '--'}
                </div>
              </div>
              <div className={styles.panelRow}>
                <div className={styles.label}>{intl.get('TWENTY_HOURS_AMOUNT')}</div>
                <div className={styles.value}>
                  {hprice ? getStrWithPrecision(quantitys, pre) : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SpinWrapper>
    )
  }
}
