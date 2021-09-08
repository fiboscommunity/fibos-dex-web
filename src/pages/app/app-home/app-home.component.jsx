import React, { PureComponent } from 'react'

import { withScatter } from 'Commons'
import { mobileTitleNavHeight } from 'Config'

import AppRouter from 'Router/app.router'

import styles from './app-home.module.css'

class HomeAppCom extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  componentDidMount() {
    const { ironmanData } = this.props

    if (ironmanData && window.__updateUI) {
      this.setHeight()
    }
  }

  componentDidUpdate(prevProps) {
    const { ironmanData } = this.props

    if (ironmanData && !prevProps.ironmanData && window.__updateUI) {
      this.setHeight()
    }
  }

  setHeight = () => {
    const { changeFieldValue } = this.props

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

  render() {
    const { initLocalesDone, mobileNavHeight } = this.props

    return (
      <div className={styles.container}>
        {initLocalesDone && [
          <div
            className={styles.bodyWrapper}
            key="body"
            style={{
              paddingTop: mobileNavHeight,
            }}>
            <AppRouter />
          </div>,
        ]}
      </div>
    )
  }
}

export default withScatter(HomeAppCom)
