import React, { PureComponent } from 'react'
import classnames from 'classnames'

import styles from './lock-icon.module.css'

class LockIcon extends PureComponent {
  render() {
    const { status } = this.props

    return (
      <div className={styles.container}>
        <span className={classnames(styles.lock, status === 'lock' ? '' : styles[status])} />
      </div>
    )
  }
}

export default LockIcon
