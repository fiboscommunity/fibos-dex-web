import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import Checkbox from 'antd/lib/checkbox'
import 'antd/lib/checkbox/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import Card from '../card'

import DelegateTable from './components/delegate-table'
import styles from './delegate.module.css'

class Delegate extends PureComponent {
  render() {
    const {
      ironmanData,
      onlyCurrent,

      changeFieldValue,
    } = this.props

    const title = (
      <div className={styles.titleWrapper}>
        <div className={styles.titleText}>{intl.get('CURRENT_DELEGATE')}</div>
        <div className={styles.hideOtherPairWrapper}>
          <div className={styles.checkbox}>
            <Checkbox
              checked={onlyCurrent}
              onChange={e => {
                if (!ironmanData || !ironmanData.fibos) {
                  return message.error(intl.get('EXTENSION_MISSING'))
                }

                return changeFieldValue('onlyCurrent', e.target.checked)
              }}
            />
          </div>
          <Button className={styles.hideOtherPairBtn} onClick={() => {}}>
            {intl.get('HIDE_OTHER_PAIRS')}
          </Button>
        </div>
      </div>
    )

    return (
      <Card className={styles.wrapper} title={title}>
        <div className={styles.content}>
          <DelegateTable />
        </div>
      </Card>
    )
  }
}

export default Delegate
