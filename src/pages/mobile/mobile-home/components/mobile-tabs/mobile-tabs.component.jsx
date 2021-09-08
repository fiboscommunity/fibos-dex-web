import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import classnames from 'classnames'

import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { mobilePathConfig } from 'Config'

import homeGrey from 'Assets/mobile/home_grey.png'
import homeHover from 'Assets/mobile/home_hover.png'
import exchangeGrey from 'Assets/mobile/exchange_grey.png'
import exchangeHover from 'Assets/mobile/exchange_hover.png'
import dealsGrey from 'Assets/mobile/deals_grey.png'
import dealsHover from 'Assets/mobile/deals_hover.png'

import styles from './mobile-tabs.module.css'

class MobileTabs extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.initTabs()
  }

  componentDidUpdate(prevProps) {
    const {
      location: { pathname },
    } = this.props

    if (prevProps.location.pathname !== pathname) {
      this.initTabs()
    }
  }

  initTabs = () => {
    const {
      location: { pathname },
      changeFieldValue,
    } = this.props

    const pathRegRes = /^\/mobile((\/)((?:[a-z][a-z0-9_]*))|(\/)|$)/m.exec(pathname)

    if (pathRegRes.length === 5 && pathRegRes[0] === '/mobile' && pathRegRes[1] === '') {
      changeFieldValue('mobileTabValue', mobilePathConfig.default)
    } else if (pathRegRes.length === 5) {
      if (mobilePathConfig[pathRegRes[3]]) {
        changeFieldValue('mobileTabValue', mobilePathConfig[pathRegRes[3]].value)
      }
    } else {
      changeFieldValue('mobileTabValue', '')
    }
  }

  _goto = (pathname, ops) => {
    const { history } = this.props

    history.push({
      pathname,
      state: {
        ...ops,
      },
    })
  }

  render() {
    const {
      location: { pathname },
      mobileTabValue,
      ironmanData,

      changeFieldValue,
    } = this.props

    return (
      <div className={styles.content}>
        <div className={styles.tabs}>
          <div
            className={classnames(styles.tabCell, styles.disabledCell)}
            key="markets"
            onClick={() => {
              const currentPath = '/mobile/markets'

              if (
                mobileTabValue !== 'markets' ||
                pathname !== '/mobile' ||
                pathname !== currentPath
              ) {
                changeFieldValue('mobileTabValue', 'markets')

                this._goto(currentPath)
              }
            }}>
            <div className={styles.tabCellContentWrapper}>
              <img
                className={styles.tabCellPic}
                src={mobileTabValue === 'markets' ? homeHover : homeGrey}
                alt=""
              />
            </div>
          </div>
          <div
            className={styles.tabCell}
            key="exchange"
            onClick={() => {
              const currentPath = '/mobile/tokenlist'

              if (mobileTabValue !== 'exchange' || pathname !== currentPath) {
                changeFieldValue('mobileTabValue', 'exchange')

                this._goto(currentPath)
              }
            }}>
            <div className={styles.tabCellContentWrapper}>
              <img
                className={styles.tabCellPic}
                src={mobileTabValue === 'exchange' ? exchangeHover : exchangeGrey}
                alt=""
              />
            </div>
          </div>
          <div
            className={classnames(styles.tabCell, styles.disabledCell)}
            key="deals"
            onClick={() => {
              const currentPath = '/mobile/deals'

              if (!ironmanData) return message.warning(intl.get('SHOULD_LOGIN_FIRST'))

              if (mobileTabValue !== 'deals' || pathname !== currentPath) {
                changeFieldValue('mobileTabValue', 'deals')

                this._goto(currentPath)
              }

              return true
            }}>
            <div className={styles.tabCellContentWrapper}>
              <img
                className={styles.tabCellPic}
                src={mobileTabValue === 'deals' ? dealsHover : dealsGrey}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(MobileTabs)
