import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

import styles from './readme.module.css'

class Readme extends PureComponent {
  constructor(props) {
    super(props)

    this.readmeList = []

    for (let index = 1; index < 38; index += 1) {
      this.readmeList.push(index)
    }
  }

  render() {
    const { show, close } = this.props

    return (
      <Modal
        className={styles.modal}
        title={intl.get('README_PART_1')}
        width={670}
        visible={show}
        closeIcon={null}
        maskClosable={false}
        onOk={close}
        onCancel={close}
        footer={[
          <Button type="primary" key="yes" onClick={close}>
            {intl.get('I_KNOWN')}
          </Button>,
        ]}>
        <div className={styles.wrapper}>
          {this.readmeList.map(item => (
            <div className={styles.paragraph} key={`readme_${item}`}>
              <em>&nbsp;</em>
              <em>&nbsp;</em>
              {intl.get(`README_PART_${item}`)}
            </div>
          ))}
        </div>
      </Modal>
    )
  }
}

export default Readme
