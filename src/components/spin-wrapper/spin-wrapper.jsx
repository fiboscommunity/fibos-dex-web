import React, { PureComponent } from 'react'
import classnames from 'classnames'

import 'antd/lib/spin/style/css'
import Spin from 'antd/lib/spin'
import 'antd/lib/icon/style/css'
import Icon from 'antd/lib/icon'

import styles from './spin-wrapper.module.css'

const antIcon = <Icon type="loading" style={{ fontSize: 30 }} spin />

class SpinWrapper extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
  }

  render() {
    const {
      children,
      indicator,
      size,
      spinning,
      className,

      height,
    } = this.props

    return (
      <div className={classnames(className, styles.spinContainer)} style={{ height: height || '' }}>
        <Spin indicator={indicator || antIcon} size={size || 'large'} spinning={spinning || false}>
          {children}
        </Spin>
      </div>
    )
  }
}

export default SpinWrapper
