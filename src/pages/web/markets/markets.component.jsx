import React, { PureComponent } from 'react'
// import QueueAnim from 'rc-queue-anim'

import TokenTable from './components/token-table'
import ProductionGrid from './components/production-grid'

import styles from './markets.module.css'

class Markets extends PureComponent {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {/* <QueueAnim key="table" type="top" duration={[500, 0]}> */}
          <TokenTable />
          {/* </QueueAnim> */}
          <ProductionGrid />
        </div>
      </div>
    )
  }
}

export default Markets
