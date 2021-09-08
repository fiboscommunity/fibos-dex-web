import React, { PureComponent } from 'react'

import ProductionGrid from './components/production-grid'

import styles from './mobile-markets.module.css'

class MobileMarkets extends PureComponent {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <ProductionGrid />
        </div>
      </div>
    )
  }
}

export default MobileMarkets
