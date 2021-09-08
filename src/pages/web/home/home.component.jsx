import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { withScatter } from 'Commons'

import HomeRouter from 'Router/web.router'
import HomeHeader from './components/header'
import HomeFooter from './components/footer'
import DownloadGuide from './components/download-guide'

import styles from './home.module.css'

class Home extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  componentDidMount() {
    message.config({
      top: 50,
      duration: 3,
      maxCount: 3,
    })
  }

  render() {
    const {
      ironman,
      initLocalesDone,
      homeMenuValue,
      ironmanData,

      requestingAnnouncements,
      announcements,

      ironmanMissing,
      ironmanError,

      showDownloadGuide,
      menuShow,

      resetIronman,
      changeFieldValue,
      requestForAnnouncement,
      clickAnnouncement,

      attachIronmanData,
    } = this.props

    return (
      <div className={styles.container}>
        {initLocalesDone && [
          <div className={styles.headerWrapper} key="header">
            <HomeHeader
              requestingAnnouncements={requestingAnnouncements}
              announcements={announcements}
              ironman={ironman}
              homeMenuValue={homeMenuValue}
              changeFieldValue={changeFieldValue}
              ironmanData={ironmanData}
              resetIronman={resetIronman}
              attachIronmanData={attachIronmanData}
              requestForAnnouncement={requestForAnnouncement}
              clickAnnouncement={clickAnnouncement}
              ironmanMissing={ironmanMissing}
              ironmanError={ironmanError}
              menuShow={menuShow}
            />
          </div>,
          <div className={styles.bodyWrapper} key="body">
            <HomeRouter />
          </div>,
          <div className={styles.footerWrapper} key="footer">
            <HomeFooter text={intl.get('FOOTER_DESCRIBE')} />
          </div>,
        ]}
        <DownloadGuide
          show={showDownloadGuide}
          close={() => {
            changeFieldValue('showDownloadGuide', false)
          }}
        />
      </div>
    )
  }
}

export default withScatter(Home)
