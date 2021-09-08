import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'

import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'

import styles from './capital-search.module.css'

class CapitalSearch extends PureComponent {
  constructor(props) {
    super(props)
    this.timer = null
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  handleSearchChange = e => {
    const { getAsset, changeFieldValue, ironmanData } = this.props
    const text = e.target.value
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      if (ironmanData) {
        changeFieldValue('expandedRowKeys', [])
        changeFieldValue('capitalSpinning', true)
        changeFieldValue('tokenFilter', text)
        getAsset(
          { account: ironmanData.account.name },
          {
            successCb: capitalTableData => {
              if (text !== '') {
                const result = capitalTableData.filter(
                  item => item.token.indexOf(text) > -1,
                )
                changeFieldValue('capitalTableData', result)
              }
              changeFieldValue('capitalSpinning', false)
            },
            failCb: () => {
              changeFieldValue('capitalSpinning', false)
            },
          },
        )
      }
    }, 500)
  }

  render() {
    return (
      <Input
        className={styles.search}
        placeholder={intl.get('ADD_PAIRS_TOKENNAME_PLACEHOLDER')}
        onChange={this.handleSearchChange}
      />
    )
  }
}

export default withRouter(CapitalSearch)
