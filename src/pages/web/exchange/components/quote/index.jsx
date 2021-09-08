import React, { PureComponent } from 'react'
import styles from './quote.module.css'

export default class Quote extends PureComponent {
  render() {
    const { children } = this.props

    return (
      <div className={styles.wrapper}>
        <span className={styles.text}>{children}</span>
      </div>
    )
  }
}
