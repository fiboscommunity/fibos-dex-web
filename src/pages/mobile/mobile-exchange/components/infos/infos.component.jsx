import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import moment from 'moment'
import BigNumber from 'bignumber.js'

import { SpinWrapper } from 'Components'
import { getStrWithPrecision } from 'Utils'
import { pollInterval } from 'Config'

import Card from '../card'
import styles from './infos.module.css'

class Infos extends PureComponent {
  constructor(props) {
    super(props)

    this.timeout = null

    this.config = [
      {
        key: 'issuer',
        label: intl.get('ISSUER'),
      },
      {
        key: 'created',
        label: intl.get('CREATE_TIME'),
        render: col => {
          if (col) {
            return moment(new Date(col)).format('YYYY-MM-DD HH:mm:ss')
          }

          return ''
        },
      },
      {
        key: 'maxSupply',
        label: intl.get('MAX_SUPPLY'),
      },
      {
        key: 'maxExchange',
        label: intl.get('EXCHANGE_MAXIMUM'),
      },
      {
        key: 'connectorBalance',
        label: intl.get('CONNECTOR_BALANCE'),
        render: (col, row) => {
          if (row.connectorBalance) {
            return `${row.connectorBalance}@${row.connectorBalanceIssuer}`
          }

          return ''
        },
      },
      {
        key: 'connectorWeight',
        label: intl.get('CONNECTOR_WEIGHT'),
        render: col => {
          if (col) {
            return `${getStrWithPrecision(new BigNumber(col).times(100), 2)} %`
          }

          return ''
        },
      },
      {
        key: 'reserveConnectorBalance',
        label: intl.get('RESERVED_CONNECTOR_BALANCE'),
      },
      {
        key: 'reserveSupply',
        label: intl.get('RESERVED_SUPPLY'),
      },
      {
        key: 'supply',
        label: intl.get('SUPPLY'),
      },
      {
        key: 'price',
        label: intl.get('REAL_TIME_PRICE'),
        render: col => {
          if (Object.prototype.toString.call(col) === '[object Number]') {
            return `${col}`
          }

          return ''
        },
      },
    ]
  }

  componentDidMount() {
    const { dstToken, tradingType } = this.props
    if (tradingType === 'uniswap' || !dstToken.tokenName) return

    this.getTokenDetails(dstToken)
  }

  componentDidUpdate(prevProps /* , prevState */) {
    const { dstToken, tradingType } = this.props

    if (tradingType === 'uniswap') return

    if (
      (!prevProps.dstToken.tokenName && dstToken.tokenName) ||
      prevProps.dstToken.tokenName !== dstToken.tokenName
    ) {
      const { changeFieldValue } = this.props

      changeFieldValue('spinningInfoData', true)
      this.getTokenDetails(dstToken)
    }

    const { requestingInfoData } = this.props

    if (!requestingInfoData && requestingInfoData !== prevProps.requestingInfoData) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  getTokenDetails = dstToken => {
    const { getTokenDetails, changeFieldValue } = this.props

    changeFieldValue('requestingInfoData', true)
    changeFieldValue('spinningInfoData', true)

    getTokenDetails(dstToken, {
      successCb: () => {
        changeFieldValue('requestingInfoData', false)
        changeFieldValue('spinningInfoData', false)
      },
      failCb: () => {
        changeFieldValue('requestingInfoData', false)
        changeFieldValue('spinningInfoData', false)
      },
    })
  }

  getInfos = () => {
    const { spinningInfoData } = this.props

    if (spinningInfoData) {
      return null
    }

    const tmpData = {
      ...this.props,
    }

    return this.config.map(item => {
      const { key, label, render } = item

      const tmpLabel = label || ''
      const tmpValue = render ? render(tmpData[key], tmpData) : tmpData[key]

      return (
        <div className={styles.contentRow} key={key}>
          <div className={styles.rowKey}>{tmpLabel}</div>
          <div className={styles.rowValue}>{tmpValue || <div>&nbsp;</div>}</div>
        </div>
      )
    })
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { dstToken } = this.props

      this.getTokenDetails(dstToken)
    }, pollInterval)

    return true
  }

  render() {
    const { ironmanData, dstToken, spinningInfoData } = this.props

    return (
      <Card
        className={styles.wrapper}
        title={ironmanData ? `${dstToken.symbol}@${dstToken.contract}` : <div>&nbsp;</div>}>
        <div className={styles.contentWrapper}>
          <SpinWrapper className={styles.spin} spinning={spinningInfoData}>
            <div className={styles.content}>{this.getInfos()}</div>
          </SpinWrapper>
        </div>
      </Card>
    )
  }
}

export default Infos
