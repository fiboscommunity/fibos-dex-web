import React, { PureComponent } from 'react'

import { LoadingAni } from 'Components'

import { errorHandler } from 'Utils'

import styles from './loading-common.module.css'

class LoadingCommon extends PureComponent {
  render() {
    const { error, timedOut, pastDelay } = this.props

    if (error) {
      errorHandler(error)
    }

    if (timedOut) {
      errorHandler(error)
    }

    if (pastDelay) {
      return (
        <div className={styles.container}>
          <LoadingAni
            className={styles.loading}
            loaderHeight={1}
            spacerWidth={0.15}
            spanWidth={1}
          />
        </div>
      )
    }

    return null
  }
}

export default LoadingCommon
