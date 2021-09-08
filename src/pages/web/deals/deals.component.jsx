import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'

import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style/css'

import { ordersConfig } from 'Config'

import PairsSearch from './components/pairs-search'
import CurrentOrderTable from './components/current-order-table'
import HistoryOrderTable from './components/history-order-table'
import DealsTable from './components/deals-table'

import styles from './deals.module.css'

class Deals extends PureComponent {
  componentDidUpdate() {
    const { ironmanData } = this.props
    if (!ironmanData) {
      // this._goto('/')
    }
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

  render() {
    const { tableType, changeFieldValue } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.radioWrapper}>
            <Radio.Group
              className={styles.radioGroup}
              value={tableType}
              onChange={e => {
                changeFieldValue('tableType', e.target.value)
              }}>
              {ordersConfig.map.map(item => (
                <Radio.Button className={styles.radioButton} value={item.key} key={item.key}>
                  {intl.get(item.labelKey)}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <div className={styles.formWrapper}>
            <div className={styles.searchWrapper}>
              <PairsSearch />
            </div>
          </div>
          <div className={styles.tableWrapper}>
            {tableType !== 'history' && tableType !== 'deals' && <CurrentOrderTable />}
            {tableType === 'history' && <HistoryOrderTable />}
            {tableType === 'deals' && <DealsTable />}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Deals)
