/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Collapse from 'antd/lib/collapse'
import 'antd/lib/collapse/style/css'

import { downloadHref, teachHref, crossHref } from 'Config'

import styles from './download-guide.module.css'

const { Panel } = Collapse

class DownloadGuide extends PureComponent {
  getFaq = () => (
    <Collapse>
      <Panel header={<div className={styles.paragraph}>{intl.get('DOWNLOAD_FAQ_1')}</div>}>
        <Collapse>
          <Panel
            header={<div className={styles.paragraph}>{intl.get('DOWNLOAD_FAQ_1_TITLE_1')}</div>}
            key="1">
            <Collapse>
              <Panel
                header={
                  <div className={styles.paragraph}>
                    {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_1')}
                  </div>
                }
                key="1">
                <div className={styles.paragraph}>
                  {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_1_CONTENT_1')}
                </div>
                <div className={styles.paragraph}>
                  {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_1_CONTENT_2')}
                </div>
              </Panel>
            </Collapse>
            <Collapse>
              <Panel
                header={
                  <div className={styles.paragraph}>
                    {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_2')}
                  </div>
                }
                key="1">
                <div className={styles.paragraph}>
                  {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_2_CONTENT_1')}
                </div>
                <div className={styles.paragraph}>
                  {intl.get('DOWNLOAD_FAQ_1_TITLE_1_SUBTITLE_2_CONTENT_2')}
                </div>
              </Panel>
            </Collapse>
          </Panel>
        </Collapse>
      </Panel>
    </Collapse>
  )

  render() {
    const { show, close } = this.props

    return (
      <Modal
        className={styles.modal}
        width={670}
        visible={show}
        closeIcon={null}
        maskClosable={false}
        onOk={close}
        onCancel={close}
        footer={[
          <Button
            className={styles.comfirm}
            type="primary"
            onClick={() => {
              window.location.reload(true)
            }}>
            {intl.get('DOWNLOAD_GUIDE_BUTTON_COMFIRM')}
          </Button>,
          <Button className={styles.cancel} onClick={close}>
            {intl.get('DOWNLOAD_GUIDE_BUTTON_CANCEL')}
          </Button>,
        ]}>
        <div className={styles.contentWrapper}>
          <div className={styles.buttonRowText}>{intl.get('DOWNLOAD_GUIDE_1')}</div>
          <div className={styles.buttonRow}>
            <Button className={styles.comfirm} type="primary">
              <a target="_blank" rel="noopener noreferrer" href={downloadHref}>
                {intl.get('DOWNLOAD_GUIDE_2')}
              </a>
            </Button>
            <Button className={styles.comfirm} type="primary">
              <a target="_blank" rel="noopener noreferrer" href={teachHref}>
                {intl.get('DOWNLOAD_GUIDE_3')}
              </a>
            </Button>
            <Button className={styles.comfirm} type="primary">
              <a target="_blank" rel="noopener noreferrer" href={crossHref}>
                {intl.get('DOWNLOAD_GUIDE_4')}
              </a>
            </Button>
          </div>
        </div>
        <div className={styles.contextWrapper}>{this.getFaq()}</div>
      </Modal>
    )
  }
}

export default DownloadGuide
