import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'

import { telegramHref, feedbackHref, bbsHref } from 'Config'

import whiteLogo from 'Assets/contact/white-logo.png'
import telegram from 'Assets/contact/telegram.png'
import feedback from 'Assets/contact/feedback.png'
import bbs from 'Assets/contact/bbs.png'

import styles from './footer.module.css'

class Footer extends PureComponent {
  render() {
    const {
      location: { pathname },

      text,
    } = this.props
    // pathname === '/deals'

    return (
      <div className={styles.content}>
        {pathname === '/' && (
          <div className={styles.contactWrapper}>
            <div className={styles.contactLeft}>
              <div className={styles.contactLeftRow}>
                <img className={styles.contactLogo} src={whiteLogo} alt="" />
              </div>
              <div className={styles.contactInfo}>{intl.get('CONTACT_INFO')}</div>
            </div>
            <div className={styles.contactRight}>
              <div className={styles.contactRightCol}>
                <div className={styles.contactUs}>{intl.get('CONTACT_US')}</div>
                <div className={styles.contactRightRow}>
                  <div className={styles.contactIconWrapperPop} id="wechat">
                    <img className={styles.qrcode} alt="" />
                    <div className={styles.wechat} />
                  </div>
                  <div className={styles.contactIconWrapperPop} id="wechatPublic">
                    <img className={styles.qrcode} alt="" />
                    <div className={styles.wechatPublic} />
                  </div>

                  <div className={styles.contactIconWrapper}>
                    <a href={telegramHref} target="_blank" rel="noopener noreferrer">
                      <img className={styles.contactIcon} src={telegram} alt="" />
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.contactRightCol}>
                <div className={styles.contactFeedback}>{intl.get('CONTACT_FEEDBACK')}</div>
                <div className={styles.contactRightRow}>
                  <div className={styles.contactIconWrapper}>
                    <a href={feedbackHref} target="_blank" rel="noopener noreferrer">
                      <img className={styles.contactIcon} src={feedback} alt="" />
                    </a>
                  </div>
                  <div className={styles.contactIconWrapper}>
                    <a href={bbsHref} target="_blank" rel="noopener noreferrer">
                      <img className={styles.contactIcon} src={bbs} alt="" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={styles.footerWrapper}>
          <div className={styles.footerText}>{text}</div>
        </div>
      </div>
    )
  }
}

export default withRouter(Footer)
