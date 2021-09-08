import React, { PureComponent } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import classnames from 'classnames'
import QueueAnim from 'rc-queue-anim'

import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'
import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'
import Dropdown from 'antd/lib/dropdown'
import 'antd/lib/dropdown/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { AniArrows } from 'Components'
import { pollInterval, linksList } from 'Config'

import logoButtonBlue from 'Assets/home/logoButtonBlue.png'
import logoIcon from 'Assets/home/logo.png'
import bannerText from 'Assets/home/bannerText.png'
import bannerLeft from 'Assets/home/bannerLeft.png'
import bannerRight from 'Assets/home/bannerRight.png'

import styles from './header.module.css'

class Header extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.initMenu()
    this.requestForAnnouncement()

    const { changeFieldValue } = this.props

    changeFieldValue('toLogin', this.login)
  }

  componentDidUpdate(prevProps) {
    const {
      location: { pathname },
      requestingAnnouncements,
    } = this.props

    if (prevProps.location.pathname !== pathname) {
      this.initMenu()
    }

    if (requestingAnnouncements !== prevProps.requestingAnnouncements) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  requestForAnnouncement = () => {
    const { changeFieldValue, requestForAnnouncement } = this.props

    changeFieldValue('requestingAnnouncements', true)

    requestForAnnouncement(
      { limit: 3 },
      {
        successCb: () => {
          changeFieldValue('requestingAnnouncements', false)
        },
        failCb: () => {
          changeFieldValue('requestingAnnouncements', false)
        },
      },
    )
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const {
        location: { pathname },
      } = this.props

      if (pathname === '/') {
        this.requestForAnnouncement()
      }
    }, pollInterval)

    return true
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

  initMenu = () => {
    const {
      location: { pathname },
      changeFieldValue,
    } = this.props

    changeFieldValue('homeMenuValue', pathname)
  }

  logout = () => {
    const { ironman, resetIronman } = this.props

    resetIronman()

    ironman
      .forgetIdentity()
      .then(() => {
        // console.log('forgetIdentity succeed')
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.warn('forgetIdentity failed: ', e)
      })
  }

  login = () => {
    const { ironmanError, ironmanMissing, attachIronmanData, changeFieldValue } = this.props

    if (ironmanMissing) {
      changeFieldValue('showDownloadGuide', true)

      return
    }

    if (ironmanError) {
      message.error(intl.get('NO_EXTENSION'))
    }

    attachIronmanData()
  }

  getAnnouncements = () => {
    const {
      location: { pathname },
      announcements,

      clickAnnouncement,
    } = this.props

    if (pathname === '/' && announcements.length > 0) {
      return (
        <div className={styles.announcementWrapper}>
          <div className={styles.announcementContent}>
            {announcements.map((item, index) => {
              const { id, title } = item

              const result = []
              result.push(
                <div className={styles.announcement} key={id}>
                  <NavLink
                    to={`/announcements/${id}`}
                    onClick={() => {
                      clickAnnouncement(id)
                    }}>
                    {title}
                  </NavLink>
                </div>,
              )

              if (index !== announcements.length - 1) {
                result.push(
                  <div className={styles.divider} key={`${id}_divider`}>
                    /
                  </div>,
                )
              }

              return [...result]
            })}
          </div>
        </div>
      )
    }

    return null
  }

  render() {
    const {
      homeMenuValue,
      ironmanData,

      menuShow,

      ironmanMissing,

      changeFieldValue,
      location: { pathname },
    } = this.props

    const linksMenu = (
      <Menu className={styles.linksMenu}>
        {linksList.map(item => {
          const { key, dslIntlKey, href } = item
          return (
            <Menu.Item className={styles.linksMenuItem} key={key}>
              <a target="_blank" rel="noopener noreferrer" href={href}>
                {intl.get(dslIntlKey)}
              </a>
            </Menu.Item>
          )
        })}
      </Menu>
    )

    if (pathname === '/exchange') {
      const menuBtns = (
        <QueueAnim className={styles.floatMenuContentWrapper} type={['left', 'right']} leaveReverse>
          <Menu
            key="menu"
            className={styles.floatMenu}
            mode="horizontal"
            defaultSelectedKeys={[]}
            selectedKeys={['/exchange'].indexOf(homeMenuValue) >= 0 ? [homeMenuValue] : []}
            onSelect={event => {
              const { key } = event
              changeFieldValue('homeMenuValue', key)
              changeFieldValue('menuShow', false)

              if (key !== homeMenuValue && key !== 'urllist') {
                this._goto(key)
              }

              return true
            }}>
            <Menu.Item key="/">
              <span className={styles.menutext}>{intl.get('HOME_PAGE')}</span>
            </Menu.Item>
            <Menu.Item key="/exchange">
              <span className={styles.menutext}>{intl.get('TRADING_CENTER')}</span>
            </Menu.Item>
            <Menu.Item key="urllist">
              <Dropdown overlay={linksMenu} className={styles.linksMenu}>
                <div className={styles.linkstext}>
                  <div>
                    {intl.get('FIBOS')}
                    <Icon type="caret-down" />
                  </div>
                </div>
              </Dropdown>
            </Menu.Item>
            {ironmanData && ironmanData.account && ironmanData.account.name && (
              <Menu.Item key="/capital">
                <NavLink to="/capital" className={styles.menutext}>
                  {intl.get('CAPITAL_LINK')}
                </NavLink>
              </Menu.Item>
            )}
            {ironmanData && ironmanData.account && ironmanData.account.name && (
              <Menu.Item key="/deals">
                <NavLink to="/deals" className={styles.menutext}>
                  {intl.get('DEALS_LINK')}
                </NavLink>
              </Menu.Item>
            )}
          </Menu>
        </QueueAnim>
      )

      return [
        <div
          className={classnames(styles.floatMenuWrapper, menuShow ? styles.open : styles.close)}
          key="menu">
          <div
            className={styles.logoBtnWrapper}
            onClick={() => {
              changeFieldValue('menuShow', !menuShow)
            }}>
            {menuShow ? (
              <div className={styles.closeBtn}>
                <Icon type="shrink" rotate={90} />
              </div>
            ) : (
              <div className={styles.logoBtnContent}>
                <img className={styles.logoBtn} src={logoButtonBlue} alt="" />
                <div className={styles.aniArrowsWrapper}>
                  <AniArrows />
                </div>
              </div>
            )}
          </div>
          {menuShow && menuBtns}
        </div>,
        <div className={styles.pluginWrapper} key="plugin">
          {ironmanData && (
            <div className={styles.loginContent} key="logout">
              <div className={styles.account}>
                {ironmanData ? ironmanData.account.name || '--' : '--'}
              </div>
              <Button className={styles.logout} type="primary" ghost onClick={this.logout}>
                {/* {intl.get('LOGOUT')} */}
                <Icon type="logout" />
              </Button>
            </div>
          )}
          {!ironmanData && (
            <div className={styles.loginContent} key="login">
              <Button className={styles.login} type="primary" ghost onClick={this.login}>
                {!ironmanMissing
                  ? `${intl.get('LOGIN')} ${intl.get('EXTENSION_NAME')}`
                  : `${intl.get('DOWNLOAD')} ${intl.get('EXTENSION_NAME')}`}
              </Button>
            </div>
          )}
        </div>,
      ]
    }

    return (
      <div className={classnames(styles.wrapper, pathname === '/exchange' ? styles.mini : '')}>
        <div className={classnames(styles.content, pathname === '/' ? styles.abs : '')}>
          <div className={styles.leftWrapper}>
            <div
              className={styles.logoWrapper}
              role="presentation"
              onClick={() => {
                this._goto('/')
              }}>
              <img className={styles.logo} src={logoIcon} alt="" />
            </div>
            <div className={styles.menuWrapper}>
              <Menu
                className={styles.menu}
                mode="horizontal"
                defaultSelectedKeys={[]}
                selectedKeys={['/exchange'].indexOf(homeMenuValue) >= 0 ? [homeMenuValue] : []}
                onSelect={event => {
                  const { key } = event
                  changeFieldValue('homeMenuValue', key)

                  if (key !== homeMenuValue) {
                    this._goto(key)
                  }

                  return true
                }}>
                <Menu.Item key="/exchange">
                  <span className={styles.menutext}>{intl.get('TRADING_CENTER')}</span>
                </Menu.Item>
              </Menu>
            </div>
            <div className={styles.linksWrapper}>
              <Dropdown overlay={linksMenu}>
                <div className={styles.linkstext}>
                  <div>
                    {intl.get('FIBOS')}
                    <Icon type="caret-down" />
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>
          <div className={styles.rightWrapper}>
            {ironmanData && ironmanData.account && ironmanData.account.name && (
              <div
                className={
                  pathname === '/capital'
                    ? classnames(styles.addonLink, styles.opened)
                    : styles.addonLink
                }>
                <NavLink to="/capital">{intl.get('CAPITAL_LINK')}</NavLink>
              </div>
            )}
            {ironmanData && ironmanData.account && ironmanData.account.name && (
              <div
                className={
                  pathname === '/deals'
                    ? classnames(styles.addonLink, styles.opened)
                    : styles.addonLink
                }>
                <NavLink to="/deals">{intl.get('DEALS_LINK')}</NavLink>
              </div>
            )}
            {ironmanData && (
              <div className={styles.loginWrapper}>
                <div className={styles.loginContent}>
                  <div className={styles.account}>
                    {ironmanData ? ironmanData.account.name || '--' : '--'}
                  </div>
                  <Button className={styles.logout} type="primary" ghost onClick={this.logout}>
                    {intl.get('LOGOUT')}
                  </Button>
                </div>
              </div>
            )}
            {!ironmanData && (
              <div className={styles.loginWrapper}>
                <div className={styles.loginContent}>
                  <Button className={styles.login} type="primary" ghost onClick={this.login}>
                    {!ironmanMissing
                      ? `${intl.get('LOGIN')} ${intl.get('EXTENSION_NAME')}`
                      : `${intl.get('DOWNLOAD')} ${intl.get('EXTENSION_NAME')}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {pathname === '/' && (
          <div className={styles.bannerWrapper}>
            <div className={styles.banner}>
              <img className={styles.bannerLeft} src={bannerLeft} alt="" />
              <img className={styles.bannerText} src={bannerText} alt="" />
              <img className={styles.bannerRight} src={bannerRight} alt="" />
            </div>
          </div>
        )}

        {this.getAnnouncements()}
      </div>
    )
  }
}

export default withRouter(Header)
