import React, { PureComponent } from 'react'
import { NavLink } from 'react-router-dom'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'

import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'

import { withBack } from 'Commons'
import { requestInterval } from 'Config'

import TokenPairsTable from './components/tokenpairs-table'
import SearchTable from './components/search-table'

import styles from './mobile-token-list.module.css'

class TokenList extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
    this.searchTimeout = null
  }

  requestForSearchData = search => {
    if (!search) return

    const { changeFieldValue, requestForSearchData } = this.props

    changeFieldValue('searchTableSpinning', true)
    changeFieldValue('searchTableRequesting', true)

    const reqFuc = () => {
      requestForSearchData(
        { search },
        {
          successCb: () => {
            changeFieldValue('searchTableSpinning', false)
            changeFieldValue('searchTableRequesting', false)
          },
          failCb: () => {
            changeFieldValue('searchTableSpinning', false)
            changeFieldValue('searchTableRequesting', false)
          },
        },
      )
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }

    this.searchTimeout = setTimeout(() => {
      reqFuc()
    }, requestInterval)
  }

  _goto = (pathname, ops) => {
    const { history } = this.props

    history.push({
      pathname,
      state: {
        ...ops,
      },
    })
  }

  render() {
    const { match, isSearching, searchValue, changeFieldValue } = this.props

    return (
      <div className={styles.wrapper}>
        <div className={styles.formController}>
          <div className={styles.inputWrapper}>
            <Input
              className={styles.input}
              allowClear
              placeholder={intl.get('MOBILE_SEARCH_TOKEN')}
              value={searchValue}
              onChange={e => {
                changeFieldValue('searchValue', e.target.value)
              }}
              onFocus={() => {
                if (!isSearching) {
                  changeFieldValue('isSearching', true)
                }
              }}
            />
          </div>
          <div className={styles.addonWrapper}>
            {!isSearching && (
              <div
                className={styles.createBtnWrapper}
                onClick={() => {
                  this._goto(
                    match.path.indexOf('/app') >= 0 ? '/app/createpair' : '/mobile/createpair',
                  )
                }}>
                <Icon className={styles.createBtn} type="plus" />
              </div>
            )}
            {isSearching && (
              <div className={styles.cancelBtnWrapper}>
                <div
                  className={styles.cancelBtn}
                  onClick={() => {
                    this.requestForSearchData(searchValue)
                  }}>
                  {intl.get('MOBILE_SEARCH')}
                </div>
                <div
                  className={styles.cancelBtn}
                  onClick={() => {
                    changeFieldValue('isSearching', false)
                  }}>
                  {intl.get('CANCEL')}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.content}>
          {!isSearching && <TokenPairsTable />}
          {isSearching && <SearchTable />}
        </div>
      </div>
    )
  }
}

export default withRouter(
  withBack(TokenList, {
    hasBackIcon: false,
    suffixIndex: '/app',
    suffix: (
      <NavLink to="/app/deals">
        <Icon type="file-text" />
      </NavLink>
    ),
  }),
)
