import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { pollInterval } from 'Config'
import { getPrecision, getStrWithPrecision, expectCal } from 'Utils'
import { Token } from 'Datasets'

import moment from 'moment'

import PriceLineChart from './components/price-line-chart'

import styles from './production-detail.module.css'

class ProductionDetail extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.requestForProductionData()
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const {
      producitonId,
      requestingProduction,

      changeFieldValue,
    } = this.props

    if (producitonId && !prevProps.producitonId) {
      changeFieldValue('spinningProduction', true)

      this.requestForProductionData()
    }

    if (!requestingProduction && requestingProduction !== prevProps.requestingProduction) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    return null
  }

  componentWillUnmount() {
    const { destroy } = this.props

    clearTimeout(this.timeout)
    destroy()
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForProductionData()
    }, pollInterval)

    return true
  }

  handleRadioChange = e => {
    const { changeFieldValue } = this.props

    changeFieldValue('chartTab', e.target.value)
  }

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

  getSupplyPrice = () => {
    const { amount, token } = this.props

    if (!token || !token.supply || !token.precision || !amount) {
      return null
    }

    const tmp = new BigNumber(token.supply).plus(token.reserve_supply).div(amount)

    return getStrWithPrecision(tmp, getPrecision(token.precision))
  }

  propertyPerUnit = () => {
    const {
      amount,
      token,
      swapData: { uniswapPrice },
    } = this.props

    if (!token || !token.supply || !token.precision || !amount || !uniswapPrice) {
      return null
    }

    const tmp = uniswapPrice.times(token.supply).plus(token.reserve_supply).div(amount)

    return getStrWithPrecision(tmp, getPrecision(token.precision))
  }

  getExpectValue = () => {
    const {
      amount,
      token,
      swapData: { uniswapPrice },
      attributes,
      repoplan,
      sevenDaysAverage,
    } = this.props

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

    const result = uniswapPrice.times(max).div(amount).toNumber()

    const duration = parseFloat(this.getRepoLimit(repoplan.endTime))

    const dayProfit = new BigNumber(sevenDaysAverage).div(amount).toNumber()

    const { residual } = attributes

    if (result && duration && !Number.isNaN(dayProfit)) {
      const calData = expectCal({
        result,
        duration,
        dayProfit,
        residual: parseFloat(residual),
      })

      return getStrWithPrecision(new BigNumber(calData.data).times(1e2), 2)
    }

    return null
  }

  addonRequest = (tokenx, tokeny) => {
    const {
      changeFieldValue,
      requestForIssueRecordData,
      getSwapRankTotal,
      getAverageRepo,
      getPriceMonthly,
      getEarningMonthly,
    } = this.props

    if (tokenx.id) {
      requestForIssueRecordData(tokenx.id)
    }

    if (tokenx.id && tokeny.id) {
      getSwapRankTotal(
        {
          tokenx: tokenx.id,
          tokeny: tokeny.id,
        },
        {
          successCb: ({ uniswapPrice }) => {
            changeFieldValue(
              'uniswapPrice',
              uniswapPrice ? getStrWithPrecision(uniswapPrice, tokeny.tokenPre) : undefined,
            )
          },
          failCb: () => {},
        },
      )

      getAverageRepo(
        {
          tokenx: tokenx.id,
          tokeny: tokeny.id,
        },
        {
          successCb: average => {
            if (average.gt(0)) {
              changeFieldValue('sevenDaysAverage', average || undefined)
            }
          },
          failCb: () => {},
        },
      )

      getPriceMonthly({
        tokenx: tokenx.id,
        tokeny: tokeny.id,
        pre: tokenx.tokenPre,
      })

      getEarningMonthly({
        tokenx: tokenx.id,
        tokeny: tokeny.id,
      })
    }
  }

  requestForProductionData() {
    const {
      producitonId,
      changeFieldValue,

      requestForProductionData,
    } = this.props

    changeFieldValue('requestingProduction', true)

    requestForProductionData(
      { id: producitonId },
      {
        successCb: data => {
          changeFieldValue('spinningProduction', false)
          changeFieldValue('requestingProduction', false)
          const tokenx = new Token({ ...data.token })
          const tokeny = new Token({ id: data.attributes.market })

          this.addonRequest(tokenx, tokeny)
        },
        failCb: () => {
          changeFieldValue('spinningProduction', false)
          changeFieldValue('requestingProduction', false)
        },
      },
    )
  }

  render() {
    const {
      chartTab,

      id,
      name,
      token,
      description,
      amount,
      company,
      attributes,
      repoplan,

      sevenDaysAverage,

      uniswapPrice,
      swapData,

      priceMonthlyData,
      priceMonthlyDataTimeStamp,
      earningMonthlyData,
      earningMonthlyDataTimeStamp,
    } = this.props

    const hasRepoAlready = Object.keys(repoplan).length > 0
    const companyText = name
      ? `${intl.get('COMPANY_PART_ONE')}${company || ''}${intl.get('COMPANY_PART_TWO')}`
      : ''
    let durationText = ''

    if (hasRepoAlready && repoplan.endTime && token.created) {
      // const created = moment(new Date(token.created)).format('YYYY-MM-DD')
      let endTime = moment(new Date(repoplan.endTime)).format('YYYY-MM-DD')
      if (endTime === 'Invalid date') {
        endTime = repoplan.endTime.split(' ')[0]
      }

      // durationText = `${intl.get('PROJECT_DURATION')}: ${created} ${intl.get('TO')} ${endTime}`
      durationText = `${intl.get('PROJECT_DURATION')}: ${intl.get('TO')} ${endTime}`
    }

    let totalMarketValue = ''
    if (Object.keys(token).length > 0 && uniswapPrice) {
      const tmpTotalMarketValue = new BigNumber(token.supply)
        .plus(token.reserve_supply)
        .times(uniswapPrice)
      totalMarketValue = getStrWithPrecision(tmpTotalMarketValue, swapData.tokeny.tokenPre) || ''
    }

    let max = ''
    if (token.supply) {
      const tmpMax = new BigNumber(token.supply).plus(token.reserve_supply)
      max = getStrWithPrecision(tmpMax, token.tokenPre) || ''
    }

    let tokenPerUnit = ''
    if (amount && token.supply) {
      const tmpTokenPerUnit = new BigNumber(token.supply).plus(token.reserve_supply).div(amount)
      tokenPerUnit = getStrWithPrecision(tmpTokenPerUnit, token.tokenPre) || ''
    }

    let thousandPieceValue = ''
    if (uniswapPrice && tokenPerUnit) {
      const tmpThousandPieceValue = new BigNumber(uniswapPrice).times(tokenPerUnit)
      thousandPieceValue =
        getStrWithPrecision(tmpThousandPieceValue, swapData.tokeny.tokenPre) || ''
    }

    const {
      location: { search },
    } = this.props

    const urlSearchObj = queryString.parse(search)

    const showChart = (urlSearchObj.y && urlSearchObj.reverse) || hasRepoAlready

    let remainValue = ''
    if (attributes.residual && amount) {
      const tmpRemainValue = new BigNumber(attributes.residual).times(amount)
      remainValue = getStrWithPrecision(tmpRemainValue, 6) || ''
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.infoGrid}>
          <div className={styles.infoGridTitle}>{name || ''}</div>
          <div className={styles.infoGridTitleTip}>
            <div className={styles.infoGridTitleTipText}>{companyText}</div>
            <div className={styles.infoGridTitleTipText}>{durationText}</div>
          </div>
          {hasRepoAlready && (
            <div className={styles.infoGridGrid}>
              <div className={styles.infoGridGridEleLeft}>
                <div className={styles.infoGridGridEleLeftLabel}>
                  {intl.get('EXPECTED_ANNUALIZED_EARNINGS')}
                </div>
                <div className={styles.infoGridGridEleLeftValue}>
                  {`${this.getExpectValue() || '0'}%`}
                </div>
              </div>
              <div className={styles.infoGridGridEleRight}>
                <div className={styles.infoGridGridEleRightLabel}>
                  {intl.get('LASTEST_REPO_SEVEN_DAYS')}
                </div>
                <div className={styles.infoGridGridEleRightValue}>
                  {uniswapPrice
                    ? getStrWithPrecision(sevenDaysAverage, swapData.tokeny.tokenPre) || '0'
                    : ''}
                </div>
              </div>
            </div>
          )}
          {token && token.tokenSymbol && token.tokenContract && (
            <div className={styles.infoGridNameRow}>
              <div className={styles.infoGridNameRowLabel}>{intl.get('TOKEN_NAME')}</div>
              <div className={styles.infoGridTokenValue}>
                <em className={styles.infoGridTokenValueSymbol}>{token.tokenSymbol || ''}</em>
                {`@${token.tokenContract || ''}`}
              </div>
            </div>
          )}
          {token && token.tokenSymbol && token.tokenContract && token.supply && (
            <em className={styles.infoGridTokenValueAddontext}>
              {`${intl.get('MAX_SUPPLY')}: ${max}`}
            </em>
          )}
          {uniswapPrice && (
            <div className={styles.infoGridPriceRow}>
              <div className={styles.infoGridPriceRowLabel}>{intl.get('NEWEST_PRICE')}</div>
              <div className={styles.infoGridPriceRowValue}>
                {`${getStrWithPrecision(uniswapPrice, swapData.tokeny.tokenPre) || '--'} ${
                  swapData && swapData.tokeny ? swapData.tokeny.dslName || '' : ''
                }`}
              </div>
            </div>
          )}
          {swapData && showChart && totalMarketValue && (
            <div className={styles.infoGridNameRow}>
              <div className={styles.infoGridNameRowLabel}>{intl.get('TOTAL_MARKET_VALUE')}</div>
              <div className={styles.infoGridNameRowValue}>
                {`${totalMarketValue || ''} ${
                  swapData && swapData.tokeny ? swapData.tokeny.dslName || '' : ''
                }`}
              </div>
            </div>
          )}
          {attributes && attributes.residual && hasRepoAlready && (
            <div className={styles.infoGridNameRow}>
              <div className={styles.infoGridNameRowLabel}>
                {intl.get('DURATION_END_REMAIN_VALUE')}
              </div>
              <div className={styles.infoGridNameRowValue}>{`${remainValue || ''} FOUSDT`}</div>
            </div>
          )}
          {amount && hasRepoAlready && (
            <div className={styles.infoGridNameRow}>
              <div className={styles.infoGridNameRowLabel}>{intl.get('PRODUCTION_AMOUNT')}</div>
              <div className={styles.infoGridNameRowValue}>
                {`${amount || ''} ${intl.get('PIECE')}`}
              </div>
            </div>
          )}
          {amount && hasRepoAlready && (
            <em className={styles.infoGridTokenValueAddontext}>
              {`1 ${intl.get('PIECE')} = ${tokenPerUnit} ${
                token.tokenSymbol || ''
              } = ${thousandPieceValue} ${
                swapData && swapData.tokeny ? swapData.tokeny.tokenSymbol || '' : ''
              }`}
            </em>
          )}
        </div>
        {showChart && (
          <div className={styles.chartWrapper}>
            <div className={styles.radioWrapper}>
              <Radio.Group
                className={styles.radioGroup}
                value={chartTab}
                onChange={this.handleRadioChange}
              >
                <Radio.Button className={styles.radioButton} value="price">
                  {intl.get('PRICE_MONTH')}
                </Radio.Button>
                {hasRepoAlready && (
                  <Radio.Button className={styles.radioButton} value="earnings">
                    {intl.get('EARNINGS_MONTH')}
                  </Radio.Button>
                )}
              </Radio.Group>
            </div>
            <div className={styles.chartWrapperContent}>
              {chartTab === 'price' && (
                <div className={styles.chartWrapper}>
                  <PriceLineChart
                    id="priceMonthly"
                    key="priceMonthly"
                    xName={`${intl.get('DATE')}`}
                    yName={`${intl.get('PRICE')}: ${
                      urlSearchObj.y ? urlSearchObj.y : attributes.market
                    }`}
                    data={priceMonthlyData}
                    timestamp={priceMonthlyDataTimeStamp}
                  />
                </div>
              )}
              {chartTab === 'earnings' && (
                <div className={styles.chartWrapper}>
                  <PriceLineChart
                    id="earningMonthly"
                    key="earningMonthly"
                    xName={`${intl.get('DATE')}`}
                    yName={`${intl.get('EARNINGS')}: ${
                      urlSearchObj.y ? urlSearchObj.y : attributes.market
                    }`}
                    data={earningMonthlyData}
                    timestamp={earningMonthlyDataTimeStamp}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {id && description && (
          <div className={styles.infos}>
            <div className={styles.infoTitle}>{intl.get('PROJECT_INFO')}</div>
            <div className={styles.infoText}>
              {description.map((item, index) => (
                <div key={`description_${index + 1}`}>
                  {item}
                  <br />
                </div>
              ))}
            </div>
          </div>
        )}
        {id && attributes && Object.prototype.toString.call(attributes.links) === '[object Array]' && (
          <div className={styles.infos}>
            <div className={styles.infoTitle}>{intl.get('RELATED_LINK')}</div>
            {attributes.links.map(item => (
              <div className={styles.infoRowLinkRow} key={item.id}>
                <div className={styles.infoRowLinkRowLabel}>{`${item.name} :`}</div>
                <div className={styles.infoRowLinkRowValue}>
                  <CopyToClipboard
                    text={item.value}
                    onCopy={() => message.success(intl.get('COPIED_URL'))}
                  >
                    <a
                      className={styles.infoRowLink}
                      href={item.value}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {intl.get('CLICK_AND_CHECK')}
                    </a>
                  </CopyToClipboard>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default ProductionDetail
