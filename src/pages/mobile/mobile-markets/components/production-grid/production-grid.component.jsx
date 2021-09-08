import React, { PureComponent } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'
import queryString from 'query-string'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import { SpinWrapper } from 'Components'
import { getStrWithPrecision, expectCal } from 'Utils'
import { pollInterval, host } from 'Config'

import moment from 'moment'

import waitingPic from 'Assets/home/waiting.jpg'
import styles from './production-grid.module.css'

class GridCardSingle extends PureComponent {
  getRepoLimit = data => {
    if (!data) {
      return {
        val: null,
      }
    }

    const nowTime = moment(new Date()).unix()
    const endTime = moment(data).unix()

    const tmpVal = Math.floor((endTime - nowTime) / 3600 / 24)

    return tmpVal
  }

  getExpectValue = () => {
    const { data } = this.props
    const { amount, token, uniswapPrice, attributes, repoplan, sevenDaysAverage } = data

    if (
      !token ||
      !token.supply ||
      !uniswapPrice ||
      !repoplan ||
      !repoplan.endTime ||
      !amount ||
      !sevenDaysAverage
    ) {
      return null
    }

    const max = new BigNumber(token.supply).plus(token.reserve_supply).toNumber()

    const result = new BigNumber(uniswapPrice)
      .times(max)
      .div(amount)
      .toNumber()

    const duration = parseFloat(this.getRepoLimit(repoplan.endTime))

    const dayProfit = new BigNumber(sevenDaysAverage).div(amount).toNumber()

    const { residual } = attributes

    if (result && duration && !Number.isNaN(dayProfit)) {
      const calData = expectCal({
        result,
        duration,
        dayProfit,
        residual,
      })

      return getStrWithPrecision(new BigNumber(calData.data || 0).times(1e2), 2)
    }

    return null
  }

  render() {
    const {
      spinning,

      data,
    } = this.props

    if (Object.keys(data).length === 0) return null

    const {
      id,
      name,
      token,
      imghash,
      uniswapPrice,
      tokenySymbol,
      tokeny,

      amount,
      attributes,
      repoplan,
      sevenDaysAverage,
    } = data
    const tokenArr =
      token && Object.prototype.toString.call(token.id) === '[object String]'
        ? token.id.split('@')
        : []
    const tokenSymbol = tokenArr[0]
    const tokenContract = tokenArr[1]

    return (
      <div className={styles.singleCardWrapper}>
        <SpinWrapper spinning={spinning}>
          <div className={styles.singleCardLeft}>
            {imghash && (
              <div className={styles.singleProductionPicWrapper}>
                <img
                  className={styles.singleProductionPic}
                  src={imghash ? `${host}/1.0/fileProc/${imghash}` : waitingPic}
                  alt=""
                />
              </div>
            )}
          </div>
          <div className={styles.singleCardRight}>
            {name && <div className={styles.singleCardTitle}>{name || ''}</div>}
            {token && uniswapPrice && amount && attributes && repoplan && sevenDaysAverage && (
              <div className={styles.singleCardNameRow}>
                <div className={styles.singleCardNameRowLabel}>
                  {intl.get('ANNUALIZE_EARNINGS_FOR_SEVEN_DAYS')}
                </div>
                <div className={styles.singleCardTokenValue}>
                  {`${this.getExpectValue() || '--'}%`}
                </div>
              </div>
            )}
            {token && (
              <div className={styles.singleCardNameRow}>
                <div className={styles.singleCardNameRowLabel}>{intl.get('TOKEN_NAME')}</div>
                <div className={styles.singleCardTokenValue}>
                  <em className={styles.singleCardTokenValueSymbol}>{tokenSymbol || ''}</em>
                  {tokenContract !== 'eosio' ? `@${tokenContract || ''}` : ''}
                </div>
              </div>
            )}
            {uniswapPrice && (
              <div className={styles.singleCardPriceRow}>
                <div className={styles.singleCardPriceRowLabel}>{intl.get('NEWEST_PRICE')}</div>
                <div className={styles.singleCardPriceRowValue}>
                  {`${getStrWithPrecision(uniswapPrice, tokeny.tokenPre) || '--'} ${
                    tokenySymbol ? tokenySymbol || '' : ''
                  }`}
                </div>
              </div>
            )}
            <div className={styles.singleCardButtonWrapper}>
              <NavLink to={`/production/${id}`}>
                <Button className={styles.singleCardButton} type="link">
                  {intl.get('CHECK_TOKEN_DETAIL')}
                </Button>
              </NavLink>
            </div>
          </div>
        </SpinWrapper>
      </div>
    )
  }
}

class GridCard extends PureComponent {
  getRepoLimit = data => {
    if (!data) {
      return {
        val: null,
      }
    }

    const nowTime = moment(new Date()).unix()
    const endTime = moment(data).unix()

    const tmpVal = Math.floor((endTime - nowTime) / 3600 / 24)

    return tmpVal
  }

  getExpectValue = () => {
    const { amount, token, uniswapPrice, attributes, repoplan, sevenDaysAverage } = this.props

    if (
      !token ||
      !token.supply ||
      !uniswapPrice ||
      !repoplan ||
      !repoplan.endTime ||
      !amount ||
      !sevenDaysAverage
    ) {
      return null
    }

    const max = token.supply

    const result = new BigNumber(uniswapPrice)
      .times(max)
      .div(amount)
      .toNumber()

    const duration = parseFloat(this.getRepoLimit(repoplan.endTime))

    const dayProfit = new BigNumber(sevenDaysAverage).div(amount).toNumber()

    const { residual } = attributes

    if (result && duration && !Number.isNaN(dayProfit)) {
      const calData = expectCal({
        result,
        duration,
        dayProfit,
        residual,
      })

      return getStrWithPrecision(new BigNumber(calData.data || 0).times(1e2), 2)
    }

    return null
  }

  render() {
    const {
      match,

      isBlank,
      spinning,

      name,
      token,
      imghash,

      attributes,
      uniswapPrice,

      tokenx,
      tokeny,
    } = this.props

    if (isBlank) {
      return (
        <div className={styles.cardWrapper}>
          <SpinWrapper spinning={spinning}>
            <div className={styles.cardHead}>
              <div className={styles.productionPicWrapper}>
                <img className={styles.productionPic} src={waitingPic} alt="" />
              </div>
              <div className={styles.innerCard}>
                <div className={styles.innerCardContent}>
                  <div className={styles.innerCardWrapper}>
                    <div className={styles.innerCardBlank}>{intl.get('PLEASE_WAITING')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardBodyBlank}>{intl.get('STAY_TUNED')}</div>
            </div>
          </SpinWrapper>
        </div>
      )
    }

    const tmpSearch = queryString.stringify({
      x: tokenx ? tokenx.id : token.id,
      y: tokeny ? tokeny.id : attributes.market,
    })

    let tmpPrice = ''
    if (uniswapPrice) {
      tmpPrice = getStrWithPrecision(uniswapPrice, tokeny.tokenPre)
    }

    const tokenArr =
      token && Object.prototype.toString.call(token.id) === '[object String]'
        ? token.id.split('@')
        : []
    const tokenSymbol = tokenArr[0]
    const tokenContract = tokenArr[1]

    return (
      <div className={styles.cardWrapper}>
        <SpinWrapper spinning={spinning}>
          <NavLink
            to={
              match.path.indexOf('/app') >= 0
                ? `/app/exchange?${tmpSearch}`
                : `/mobile/exchange?${tmpSearch}`
            }>
            <div className={styles.cardHead}>
              <div className={styles.productionPicWrapper}>
                <img
                  className={styles.productionPic}
                  src={imghash ? `${host}/1.0/fileProc/${imghash}` : waitingPic}
                  alt=""
                />
              </div>
              <div className={styles.innerCard}>
                <div className={styles.innerCardContent}>
                  <div className={styles.innerCardWrapper}>
                    <div className={styles.innerCardHead}>
                      {intl.get('ANNUALIZE_EARNINGS_FOR_SEVEN_DAYS')}
                    </div>
                    <div className={styles.innerCardBody}>
                      {`${this.getExpectValue() || '--'}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardBodyTitle}>{name}</div>
              <div className={styles.cardBodyNameWrapper}>
                <div className={styles.cardBodyNameLabel}>{intl.get('TOKEN_NAME')}</div>
                <div className={styles.cardBodyName}>
                  {tokenSymbol || ''}
                  {tokenContract !== 'eosio' ? `@${tokenContract || ''}` : ''}
                </div>
              </div>
              <div className={styles.cardBodyPriceWrapper}>
                <div className={styles.cardBodyPriceContent}>
                  <div className={styles.cardBodyPriceLabel}>{intl.get('NEWEST_PRICE')}</div>
                  <div className={styles.cardBodyPrice}>
                    {`${tmpPrice || '--'}`}
                    <em>{tokeny.dslName}</em>
                  </div>
                </div>
              </div>
            </div>
          </NavLink>
        </SpinWrapper>
      </div>
    )
  }
}

class ProductionGrid extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.requestForProductionData()
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { productionGridRequesting } = this.props

    if (productionGridRequesting !== prevProps.productionGridRequesting) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  requestForProductionData = () => {
    const {
      changeFieldValue,
      requestForProductionData,
      requestForTotalOfProductionData,
    } = this.props

    changeFieldValue('productionGridRequesting', true)

    requestForTotalOfProductionData(
      {},
      {
        successCb: () => {
          requestForProductionData(
            {},
            {
              successCb: () => {
                changeFieldValue('productionGridSpinning', false)
                changeFieldValue('productionGridRequesting', false)
              },
              failCb: () => {
                changeFieldValue('productionGridSpinning', false)
                changeFieldValue('productionGridRequesting', false)
              },
            },
          )
        },
        failCb: () => {
          changeFieldValue('productionGridSpinning', false)
          changeFieldValue('productionGridRequesting', false)
        },
      },
    )
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForProductionData()
    }, pollInterval)

    return true
  }

  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  render() {
    const { match, productionGridSpinning, gridDataTotal, gridData } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleText}>{intl.get('HOT_SALE')}</div>
          <div className={styles.titleTextTip}>{intl.get('HOT_SALE_US')}</div>
        </div>
        {gridDataTotal === 1 && (
          <GridCardSingle spinning={productionGridSpinning} data={gridData[0]} />
        )}
        {gridDataTotal > 1 && (
          <div className={styles.gridWrapper}>
            {gridData.map((item, index) => {
              const {
                id,
                name,
                token,
                imghash,
                status,
                description,
                amount,
                attributes,
                repoplan,
                company,
                uniswapPrice,
                sevenDaysAverage,
                tokenx,
                tokeny,
              } = item

              if (!id) {
                const tmpKey = `blank_${index}`
                return (
                  <GridCard key={tmpKey} isBlank spinning={productionGridSpinning} match={match} />
                )
              }

              return (
                <GridCard
                  key={id}
                  spinning={productionGridSpinning}
                  match={match}
                  id={id}
                  name={name}
                  token={token}
                  imghash={imghash}
                  status={status}
                  description={description}
                  amount={amount}
                  attributes={attributes}
                  repoplan={repoplan}
                  company={company}
                  uniswapPrice={uniswapPrice}
                  sevenDaysAverage={sevenDaysAverage}
                  tokenx={tokenx}
                  tokeny={tokeny}
                />
              )
            })}
          </div>
        )}
        {/* {gridDataTotal > producitonCount && (
          <div className={styles.moreWrapper}>
            <Button
              className={styles.more}
              onClick={() => {
                this._goto('/productions')
              }}>
              {intl.get('MORE')}
              <Icon type="right" />
            </Button>
          </div>
        )} */}
      </div>
    )
  }
}

export default withRouter(ProductionGrid)
