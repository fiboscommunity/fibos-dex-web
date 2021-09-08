import React, { PureComponent } from 'react'

import ProductionsTable from './components/productions-table'

import styles from './productions.module.css'

class Productions extends PureComponent {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <ProductionsTable />
        </div>
      </div>
    )
  }
}

export default Productions
