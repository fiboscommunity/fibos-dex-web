import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'
import Checkbox from 'antd/lib/checkbox'
import 'antd/lib/checkbox/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import Card from '../card'

import DelegateTable from './components/delegate-table'
import RecordTable from './components/record-table'
import RepoTable from './components/repo-table'
import styles from './records.module.css'

class Records extends PureComponent {
  render() {
    const {
      ironmanData,
      onlyCurrent,

      tradingType,
      recordPanelTab,

      repoDataTotal,

      changeFieldValue,
    } = this.props

    const menuArray = [
      {
        key: 'record',
        intl: `${intl.get('TRADE')}${intl.get('RECORDS')}`,
      },
    ]

    if (tradingType === 'uniswap') {
      menuArray.push({
        key: 'delegate',
        intl: `${intl.get('CURRENT_DELEGATE')}`,
      })
    }

    if (repoDataTotal > 0) {
      menuArray.push({
        key: 'repo',
        intl: `${intl.get('REPO')}${intl.get('RECORDS')}`,
        show: repoDataTotal > 0,
      })
    }

    const title = (
      <div className={styles.titleWrapper}>
        <div className={styles.menuWrapper}>
          <Menu
            className={styles.menu}
            mode="horizontal"
            defaultSelectedKeys={[]}
            selectedKeys={[recordPanelTab]}
            onSelect={e => {
              changeFieldValue('recordPanelTab', e.key)
            }}>
            {menuArray.map((item, index) => (
              <Menu.Item
                key={item.key}
                className={index === menuArray.length - 1 ? styles.lastMenuItem : ''}>
                <span className={styles.menutext}>{item.intl}</span>
              </Menu.Item>
            ))}
          </Menu>
        </div>
        {recordPanelTab === 'delegate' && (
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
        )}
      </div>
    )

    return (
      <Card
        className={styles.wrapper}
        title={tradingType === 'bancor' ? `${intl.get('TRADE')}${intl.get('RECORDS')}` : title}>
        <div className={styles.content}>
          {recordPanelTab === 'delegate' && <DelegateTable />}
          {recordPanelTab === 'record' && <RecordTable />}
          {recordPanelTab === 'repo' && <RepoTable />}
        </div>
      </Card>
    )
  }
}

export default Records
