import React, { PureComponent } from 'react'

import PageNotFound from 'Assets/commons/404_mobile.png'

import styles from './no-match.module.css'

class NoMatch extends PureComponent {
  render() {
    return (
      <div className={styles.wrapper}>
        <img className={styles.img} src={PageNotFound} alt="" />
      </div>
    )
  }
}

export default NoMatch
