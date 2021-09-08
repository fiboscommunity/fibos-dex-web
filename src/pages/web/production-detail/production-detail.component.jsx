import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style/css'
import Checkbox from 'antd/lib/checkbox'
import 'antd/lib/checkbox/style/css'

import { pollInterval, repoToolPageHref } from 'Config'
import { getPrecision, getStrWithPrecision, expectCal } from 'Utils'
import { Token } from 'Datasets'

import moment from 'moment'

import PriceLineChart from './components/price-line-chart'
import Readme from './components/readme'

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
      match: {
        params: { id },
      },
      requestingProduction,

      changeFieldValue,
    } = this.props

    if (id && !prevProps.match.params.id) {
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

  handleCheckChange = e => {
    const { changeFieldValue } = this.props

    changeFieldValue('isAgree', e.target.checked)
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

    const tmp = uniswapPrice
      .times(token.supply)
      .plus(token.reserve_supply)
      .div(amount)

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

    const result = uniswapPrice
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
      match: {
        params: { id },
      },
      changeFieldValue,

      requestForProductionData,
      requestForTokenData,
      requestForTokenPairData,
    } = this.props

    changeFieldValue('requestingProduction', true)

    if (Number.isNaN(parseInt(id, 10))) {
      const {
        location: { search },
      } = this.props

      const urlSearchObj = queryString.parse(search)

      if (urlSearchObj.y && urlSearchObj.reverse) {
        const { y } = urlSearchObj

        const reverse = urlSearchObj.reverse === 'true'

        requestForTokenPairData(
          {
            tokenx: reverse ? y : id,
            tokeny: reverse ? id : y,
            reverse,
          },
          {
            successCb: data => {
              changeFieldValue('spinningProduction', false)
              changeFieldValue('requestingProduction', false)

              const tokenx = new Token({ ...data.tokenx })
              const tokeny = new Token({ ...data.tokeny })

              if (reverse) {
                this.addonRequest(tokeny, tokenx)
              } else {
                this.addonRequest(tokenx, tokeny)
              }
            },
            failCb: () => {
              changeFieldValue('spinningProduction', false)
              changeFieldValue('requestingProduction', false)
            },
          },
        )
      } else {
        requestForTokenData(
          {
            id,
          },
          {
            successCb: data => {
              changeFieldValue('spinningProduction', false)
              changeFieldValue('requestingProduction', false)
              const tokenx = new Token({ ...data })

              this.addonRequest(tokenx)
            },
            failCb: () => {
              changeFieldValue('spinningProduction', false)
              changeFieldValue('requestingProduction', false)
            },
          },
        )
      }
    } else {
      requestForProductionData(
        { id },
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
  }

  render() {
    const {
      chartTab,
      isAgree,
      readmeShow,

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

      changeFieldValue,
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
      const endTime = moment(new Date(repoplan.endTime)).format('YYYY-MM-DD')

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
        <div className={styles.rowCard}>
          {showChart && (
            <div className={styles.leftPanel}>
              <div className={styles.radioWrapper}>
                <Radio.Group
                  className={styles.radioGroup}
                  value={chartTab}
                  onChange={this.handleRadioChange}>
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
              <div className={styles.leftPanelContent}>
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
          <div className={styles.rightPanel}>
            <div className={styles.rightPanelTitle}>{name || ''}</div>
            <div className={styles.rightPanelTitleTip}>
              <div className={styles.rightPanelTitleTipText}>{companyText}</div>
              <div className={styles.rightPanelTitleTipText}>{durationText}</div>
            </div>
            {hasRepoAlready && (
              <div className={styles.rightPanelGrid}>
                <div className={styles.rightPanelGridEleLeft}>
                  <div className={styles.rightPanelGridEleLeftLabel}>
                    {intl.get('EXPECTED_ANNUALIZED_EARNINGS')}
                  </div>
                  <div className={styles.rightPanelGridEleLeftValue}>
                    {`${this.getExpectValue() || '0'}%`}
                  </div>
                </div>
                <div className={styles.rightPanelGridEleRight}>
                  <div className={styles.rightPanelGridEleRightLabel}>
                    {intl.get('LASTEST_REPO_SEVEN_DAYS')}
                  </div>
                  <div className={styles.rightPanelGridEleRightValue}>
                    {uniswapPrice
                      ? getStrWithPrecision(sevenDaysAverage, swapData.tokeny.tokenPre) || '0'
                      : ''}
                  </div>
                </div>
              </div>
            )}
            {token && token.id && (
              <div className={styles.rightPanelNameRow}>
                <div className={styles.rightPanelNameRowLabel}>{intl.get('TOKEN_NAME')}</div>
                <div className={styles.rightPanelTokenValue}>
                  <em className={styles.rightPanelTokenValueSymbol}>{token.tokenSymbol || ''}</em>
                  {`@${token.tokenContract || ''}`}
                  {token.supply && (
                    <em className={styles.rightPanelTokenValueAddontext}>
                      {`${intl.get('MAX_SUPPLY')}: ${max}`}
                    </em>
                  )}
                </div>
              </div>
            )}
            {uniswapPrice && (
              <div className={styles.rightPanelPriceRow}>
                <div className={styles.rightPanelPriceRowLabel}>{intl.get('NEWEST_PRICE')}</div>
                <div className={styles.rightPanelPriceRowValue}>
                  {`${getStrWithPrecision(uniswapPrice, swapData.tokeny.tokenPre) || '--'} ${
                    swapData && swapData.tokeny ? swapData.tokeny.dslName || '' : ''
                  }`}
                </div>
              </div>
            )}
            {swapData && showChart && totalMarketValue && (
              <div className={styles.rightPanelNameRow}>
                <div className={styles.rightPanelNameRowLabel}>
                  {intl.get('TOTAL_MARKET_VALUE')}
                </div>
                <div className={styles.rightPanelNameRowValue}>
                  {`${totalMarketValue || ''} ${
                    swapData && swapData.tokeny ? swapData.tokeny.dslName || '' : ''
                  }`}
                </div>
              </div>
            )}
            {attributes && attributes.residual && hasRepoAlready && (
              <div className={styles.rightPanelNameRow}>
                <div className={styles.rightPanelNameRowLabel}>
                  {intl.get('DURATION_END_REMAIN_VALUE')}
                </div>
                <div className={styles.rightPanelNameRowValue}>{`${remainValue || ''} FOUSDT`}</div>
              </div>
            )}
            {amount && hasRepoAlready && (
              <div className={styles.rightPanelNameRow}>
                <div className={styles.rightPanelNameRowLabel}>{intl.get('PRODUCTION_AMOUNT')}</div>
                <div className={styles.rightPanelNameRowValue}>
                  {`${amount || ''} ${intl.get('PIECE')}`}
                  <em className={styles.rightPanelTokenValueAddontext}>
                    {`1 ${intl.get('PIECE')} = ${tokenPerUnit} ${token.tokenSymbol ||
                      ''} = ${thousandPieceValue} ${
                      swapData && swapData.tokeny ? swapData.tokeny.tokenSymbol || '' : ''
                    }`}
                  </em>
                </div>
              </div>
            )}
            {hasRepoAlready && (
              <div className={styles.rightPanelButtonWrapper}>
                <Button
                  className={styles.rightPanelButton}
                  type="primary"
                  disabled={!isAgree || !token.id || !attributes.market}
                  onClick={() => {
                    const { tokenx, tokeny, reverse } = attributes

                    const tmpUri = queryString.stringify({
                      x: !reverse ? tokenx : tokeny,
                      y: !reverse ? tokeny : tokenx,
                    })

                    const { history } = this.props

                    history.push({
                      pathname: '/exchange',
                      search: tmpUri,
                    })
                  }}>
                  {intl.get('BUY_IMMEDIATELY')}
                </Button>
                <Button
                  className={styles.rightPanelRepoButton}
                  disabled={!token.id || !attributes.market}>
                  <a href={repoToolPageHref} target="_blank" rel="noopener noreferrer">
                    {intl.get('START_REPO')}
                  </a>
                </Button>
              </div>
            )}
            {hasRepoAlready && (
              <div className={styles.rightPanelReadme}>
                <div className={styles.rightPanelReadmeCheckWrapper}>
                  <Checkbox checked={isAgree} onChange={this.handleCheckChange} />
                </div>
                <div className={styles.rightPanelReadmeText}>
                  {intl.get('README_PART_ONE')}
                  <em
                    onClick={() => {
                      changeFieldValue('readmeShow', true)
                    }}>
                    <div>{intl.get('README_DEAL')}</div>
                  </em>
                  {intl.get('README_PART_TWO')}
                </div>
              </div>
            )}
          </div>
        </div>
        {id && description && attributes && (
          <div className={styles.rowInfoCard}>
            <div className={styles.infoTitle}>{intl.get('PROJECT_INFO')}</div>
            <div className={styles.infoText}>
              {description.map((item, index) => (
                <div key={`description_${index + 1}`}>
                  {item}
                  <br />
                </div>
              ))}
            </div>
            {Object.prototype.toString.call(attributes.links) === '[object Array]' && (
              <div className={styles.infoRowLink}>
                <div className={styles.infoRowLinkLabel}>{intl.get('RELATED_LINK')}</div>
                {attributes.links.map(item => (
                  <div className={styles.infoRowLinkRow} key={item.id}>
                    <div className={styles.infoRowLinkRowLabel}>{`${item.name} :`}</div>
                    <div className={styles.infoRowLinkRowValue}>
                      <a
                        className={styles.infoRowLink}
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer">
                        {intl.get('CLICK_AND_CHECK')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <Readme
          show={readmeShow}
          close={() => {
            changeFieldValue('readmeShow', false)
          }}
        />
      </div>
    )
  }
}

export default ProductionDetail
