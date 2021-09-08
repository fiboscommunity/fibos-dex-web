import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'

import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'

import styles from './pairs-search.module.css'

const { Option } = Select

class PairsSearch extends PureComponent {
  componentDidMount() {
    const { requestForSearchingPairs } = this.props

    requestForSearchingPairs({ search: '' })
  }

  searchOnchange = (value, option) => {
    const { changeFieldValue, resetPairsDropList } = this.props
    if (!option) {
      changeFieldValue('pairId', undefined)
      changeFieldValue('searchVal', undefined)
      resetPairsDropList()

      return
    }

    const {
      props: { data },
    } = option

    if (data && Object.keys(data).length > 0) {
      this.handleOptionClick(data)
    }
  }

  searchForPairs = e => {
    const { resetPairsDropList, requestForSearchingPairs } = this.props

    if (Object.prototype.toString.call(e) === '[object String]') {
      requestForSearchingPairs({ search: e })
    } else {
      resetPairsDropList()
    }
  }

  handleOptionClick = data => {
    const { id, dstToken, srcToken } = data
    const { changeFieldValue, requestForSearchingPairs } = this.props
    const tmpVal = `${dstToken.tokenName}/${srcToken.tokenName}`

    changeFieldValue('pairId', id)
    changeFieldValue('searchVal', tmpVal)
    requestForSearchingPairs({ search: '' })
  }

  getOptions = data => {
    if (Object.prototype.toString.call(data) === '[object Array]' && data.length > 0) {
      return data.map(item => {
        const { dstToken, srcToken } = item
        const tmpVal = `${dstToken.tokenName}/${srcToken.tokenName}`

        return (
          <Option key={tmpVal} value={tmpVal} data={item}>
            <div className={styles.optionWrapper}>
              <div className={styles.dstRow}>{`${dstToken.tokenName}`}</div>
              <div className={styles.srcRow}>{`${srcToken.tokenName}`}</div>
            </div>
          </Option>
        )
      })
    }

    return []
  }

  render() {
    const { searchVal, pairsDropList } = this.props

    return (
      <div className={styles.formWrapper}>
        <div className={styles.searchWrapper} id={styles.searchWrapper}>
          <Select
            allowClear
            showSearch
            className={styles.search}
            dropdownClassName={styles.dropdownClassName}
            value={searchVal}
            placeholder={intl.get('SEARCH_TOKEN_PLACEHOLDER')}
            onSearch={this.searchForPairs}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            notFoundContent={intl.get('RACORD_NO_SEARCH_DATA')}
            getPopupContainer={() => document.getElementById(styles.searchWrapper)}
            onChange={this.searchOnchange}>
            {this.getOptions(pairsDropList)}
          </Select>
        </div>
      </div>
    )
  }
}

export default withRouter(PairsSearch)
