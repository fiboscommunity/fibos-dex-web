import React, { PureComponent } from 'react'
import styles from './quote.module.css'

export default class Quote extends PureComponent {
  render() {
    const { children, title, addon, height } = this.props

    return (
      <div className={styles.wrapper} style={{ height: height || '' }}>
        <span className={styles.text}>{children || title}</span>
        {addon}
      </div>
    )
  }
}
