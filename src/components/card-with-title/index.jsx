import React, { PureComponent } from 'react'
import classnames from 'classnames'

import Quote from './quote'

import styles from './card-with-title.module.css'

export default class CardWithTitle extends PureComponent {
  render() {
    const { children, className, title, addon } = this.props

    return (
      <div className={classnames(styles.wrapper, className)}>
        {title && <Quote title={title} addon={addon} />}
        {children}
      </div>
    )
  }
}
