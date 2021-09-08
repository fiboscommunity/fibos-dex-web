import React, { PureComponent } from 'react'
import { NavLink } from 'react-router-dom'
import intl from 'react-intl-universal'

import { SpinWrapper } from 'Components'
import { pollInterval, host } from 'Config'

import moment from 'moment'

import styles from './announcements.module.css'

class Announcements extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    this.requestForAnnouncements()
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id },
      },

      announcementsRequesting,

      changeFieldValue,
    } = this.props

    if ((id && !prevProps.match.params.id) || id !== prevProps.match.params.id) {
      changeFieldValue('announcementsSpinning', true)

      this.requestForAnnouncements()
    }

    if (!announcementsRequesting && announcementsRequesting !== prevProps.announcementsRequesting) {
      clearTimeout(this.timeout)
      this.startPoll()
    }
  }

  componentWillUnmount() {
    const { destroy } = this.props

    clearTimeout(this.timeout)
    destroy()
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      this.requestForAnnouncements()
    }, pollInterval)

    return true
  }

  getAnnouncementsEles = () => {
    const { announcementsData } = this.props

    return announcementsData.map(item => {
      const { title, id } = item

      return (
        <div className={styles.leftPanelListsItem} key={id}>
          <NavLink to={`/announcements/${id}`}>{title}</NavLink>
        </div>
      )
    })
  }

  getTargetAnnouncement = (data, id) => {
    const { changeFieldValue } = this.props

    data.forEach(item => {
      if (parseInt(id, 10) === item.id) {
        changeFieldValue('announcement', { ...item })
      }
    })
  }

  requestForAnnouncements() {
    const {
      match: {
        params: { id },
      },

      changeFieldValue,
      requestForAnnouncements,
    } = this.props

    changeFieldValue('announcementsRequesting', true)
    requestForAnnouncements(
      {},
      {
        successCb: data => {
          if (id) {
            this.getTargetAnnouncement(data, id)
            changeFieldValue('announcementsSpinning', false)
          } else if (data.length >= 1) {
            changeFieldValue('announcement', { ...data[0] })
          }

          changeFieldValue('announcementsRequesting', false)
        },
        failCb: () => {
          changeFieldValue('announcementsSpinning', false)
          changeFieldValue('announcementsRequesting', false)
        },
      },
    )
  }

  render() {
    const { announcementsSpinning, announcement } = this.props
    const { title, content, user, imghash, createdAt } = announcement
    const tmpTime = moment(new Date(createdAt)).format('YYYY-MM-DD HH:mm:ss')

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <SpinWrapper spinning={announcementsSpinning}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelTitle}>{intl.get('ANNOUNCEMENTS_TITLE')}</div>
              <div className={styles.leftPanelLists}>{this.getAnnouncementsEles()}</div>
            </div>
            <div className={styles.rightPanel}>
              <div className={styles.rightPanelTitle}>{title}</div>
              <div className={styles.rightPanelTime}>
                {createdAt && user ? `${`${user.id} · `}${tmpTime}` : ''}
              </div>
              <div className={styles.rightPanelContent}>{content}</div>
              {imghash && (
                <div className={styles.rightPanelImgWrapper}>
                  <img
                    className={styles.rightPanelImg}
                    src={`${host}/1.0/fileProc/${imghash}`}
                    alt=""
                  />
                </div>
              )}
            </div>
          </SpinWrapper>
        </div>
      </div>
    )
  }
}

export default Announcements
