import React, { PureComponent } from 'react'
import classnames from 'classnames'

import styles from './ani-arrows.module.css'

class AniArrows extends PureComponent {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.arrowAnim}>
          <div className={styles.arrowSliding}>
            <div className={styles.arrow} />
          </div>
          <div className={classnames(styles.arrowSliding, styles.delay1)}>
            <div className={styles.arrow} />
          </div>
          <div className={classnames(styles.arrowSliding, styles.delay2)}>
            <div className={styles.arrow} />
          </div>
          <div className={classnames(styles.arrowSliding, styles.delay3)}>
            <div className={styles.arrow} />
          </div>
        </div>
      </div>
    )
  }
}

export default AniArrows
