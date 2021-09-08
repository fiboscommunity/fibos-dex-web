import React from 'react'
import intl from 'react-intl-universal'

import Tooltip from 'antd/lib/tooltip'
import 'antd/lib/tooltip/style/css'
import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'

import styles from './fee-tip.module.css'

const FeeTipDetail = () => (
  <div className={styles.wrapper}>
    <div className={styles.row}>{intl.get('FEE_TIP_TITLE')}</div>
    <div className={styles.row}>{intl.get('FEE_TIP_ROW_1')}</div>
    <div className={styles.row}>{intl.get('FEE_TIP_ROW_2')}</div>
  </div>
)

const FeeTip = () => (
  <Tooltip className={styles.question} title={<FeeTipDetail />}>
    <Icon type="question-circle" />
  </Tooltip>
)

export default FeeTip
