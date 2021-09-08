import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import { NavLink } from 'react-router-dom'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'

import Popover from 'antd/lib/popover'
import 'antd/lib/popover/style/css'

import { getStrWithPrecision } from 'Utils'
import { SpinWrapper } from 'Components'

import styles from './ticker.module.css'

function display(extendSymbol) {
  const symbol = extendSymbol ? extendSymbol.split('@')[0] || '' : ''
  const contract = extendSymbol ? extendSymbol.split('@')[1] || '' : ''
  return contract === 'eosio' ? symbol : extendSymbol || ''
}

export default class Ticker extends PureComponent {
  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  getContent = () => {
    const {
      srcTokenName,
      dstTokenName,
      needToReverse,
      detailData: { id, hasrepoplan, description },
    } = this.props

    let tmpUri = ''
    if (dstTokenName && srcTokenName) {
      const queryObj = {
        y: srcTokenName,
      }

      if (Object.prototype.toString.call(needToReverse) === '[object Boolean]') {
        queryObj.reverse = needToReverse
      }

      tmpUri = queryString.stringify(queryObj)
    }

    return (
      <div className={styles.tipWrapper}>
        <div className={styles.tipTitle}>{dstTokenName}</div>
        <div className={styles.tipContent}>{description || intl.get('TEMPORARY_INVALI')}</div>
        {hasrepoplan === 'yes' && (
          <div className={styles.tipLink}>
            <NavLink to={`/production/${id}`}>{intl.get('CHECK_TOKEN_DETAIL')}</NavLink>
          </div>
        )}
        {(hasrepoplan === 'no' || !hasrepoplan) && (
          <div className={styles.tipLink}>
            <NavLink to={`/token/${dstTokenName}?${tmpUri}`}>
              {intl.get('CHECK_TOKEN_DETAIL')}
            </NavLink>
          </div>
        )}
      </div>
    )
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
        <dd className={dayRateDrection !== 'up' ? styles.color_down : styles.color_up}>
          {dayRateDrection && dayRate
            ? `${dayRateDrection === 'up' ? '+' : '-'}${dayRate}%`
            : '+--%'}
        </dd>
      )
    }

    return null
  }

  render() {
    const {
      oneDayKdata,
      spinning,
      dstTokenName,
      srcTokenName,
      pre,
      pricePre,
      lastPrice,
    } = this.props
    const { hprice, lprice, quantitys } = oneDayKdata

    return (
      <SpinWrapper spinning={spinning} height={69}>
        <div className={styles.wrapper}>
          <Popover
            className={styles.symbol_name}
            overlayClassName={styles.symbolNameTip}
            placement="bottom"
            title={null}
            content={this.getContent()}
            trigger="hover">
            <span className={styles.symbola}>{display(dstTokenName) || '--@--'}</span>
            <span className={styles.symbolb}>{display(srcTokenName) || '--@--'}</span>
          </Popover>
          <div className={styles.content}>
            <dl>
              <dt>盘口最新价</dt>
              <dd>{lastPrice ? `${getStrWithPrecision(lastPrice, pricePre)}` : '--'}</dd>
            </dl>
            <dl>
              <dt>24H 涨跌</dt>
              {this.getDayChange()}
            </dl>
            <dl>
              <dt>24H 最高价</dt>
              <dd>{hprice ? getStrWithPrecision(hprice, pricePre) : '--'}</dd>
            </dl>
            <dl>
              <dt>24H 最低价</dt>
              <dd>{lprice ? getStrWithPrecision(lprice, pricePre) : '--'}</dd>
            </dl>
            <dl>
              <dt>24H 成交量</dt>
              <dd>{hprice ? getStrWithPrecision(quantitys, pre) : '--'}</dd>
            </dl>
          </div>
        </div>
      </SpinWrapper>
    )
  }
}
