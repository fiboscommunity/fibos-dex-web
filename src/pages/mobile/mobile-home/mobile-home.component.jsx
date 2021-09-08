import React, { PureComponent } from 'react'

import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { withScatter } from 'Commons'
import { mobileTitleNavHeight } from 'Config'

import MobilleRouter from 'Router/mobile.router'
import MobileTabs from './components/mobile-tabs'

import styles from './mobile-home.module.css'

class HomeMobile extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  componentDidMount() {
    message.config({
      top: 200,
      duration: 2,
      maxCount: 3,
    })
  }

  componentDidUpdate(prevProps) {
    const { ironmanData, changeFieldValue } = this.props

    if (ironmanData && !prevProps.ironmanData && window.__updateUI) {
      window.__updateUI({
        navShow: false,
        // frontColor: '#000000',
        // navBackgroundColor: '#FFFFFF',
        // titleColor: '#FFFFFF',
        // safeBackgroundColor: '#FFFFFF',
        // title: 'title here',
      })

      const { navHeight } = window.__config

      changeFieldValue('mobileNavHeight', parseInt(navHeight, 10) - mobileTitleNavHeight)
    }
  }

  render() {
    const { initLocalesDone, mobileNavHeight } = this.props

    return (
      <div className={styles.container}>
        {initLocalesDone && [
          <div
            className={styles.bodyWrapper}
            key="body"
            style={{
              marginTop: mobileNavHeight,
            }}>
            <MobilleRouter />
          </div>,
          <div className={styles.footerWrapper} key="footer">
            <MobileTabs />
          </div>,
        ]}
      </div>
    )
  }
}

export default withScatter(HomeMobile)
