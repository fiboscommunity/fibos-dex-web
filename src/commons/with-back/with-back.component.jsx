import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import classnames from 'classnames'

import Icon from 'antd/lib/icon'

import { Token } from 'Datasets'
import { mobilePathConfig, appPathConfig } from 'Config'

import styles from './with-back.module.css'

// eslint-disable-next-line arrow-body-style
const withBack = (WrappedComponent, opts = {}) => {
  const options = {
    hasBackIcon: true,
    ...opts,
  }

  return withRouter(
    class withBackCompo extends PureComponent {
      constructor(props) {
        super(props)
        this.state = { ...this.checkOptions() }
      }

      componentDidMount() {
        this.withPathName()
      }

      componentDidUpdate(prevProps) {
        const {
          location: { pathname },
        } = this.props

        if (prevProps.location.pathname !== pathname) {
          this.withPathName()
        }
      }

      checkOptions = () => {
        if (Object.keys(options).length > 0) {
          return { ...options }
        }

        return {}
      }

      withPathName = () => {
        const {
          location: { pathname },
          match,
        } = this.props

        let pathRegRes = /^\/mobile((\/)((?:[a-z][a-z0-9_]*))|(\/)|$)/m.exec(pathname)
        let pathMode = 'mobile'
        if (match.path.slice(0, 7) !== '/mobile') {
          pathRegRes = /^\/app((\/)((?:[a-z][a-z0-9_]*))|(\/)|$)/m.exec(pathname)
          pathMode = 'app'
        }

        if (
          pathRegRes.length === 5 &&
          !((pathRegRes[0] === '/mobile' || pathRegRes[0] === '/app') && pathRegRes[1] === '') &&
          mobilePathConfig[pathRegRes[3]]
        ) {
          if (pathRegRes[3] !== 'exchange') {
            if (pathMode === 'mobile' && mobilePathConfig[pathRegRes[3]].intl) {
              this.setState({
                title: intl.get(mobilePathConfig[pathRegRes[3]].intl),
              })
            }

            if (pathMode === 'app' && appPathConfig[pathRegRes[3]].intl) {
              this.setState({
                title: intl.get(appPathConfig[pathRegRes[3]].intl),
              })
            }
          } else {
            const {
              location: { search },
            } = this.props

            const { x, y } = queryString.parse(search)

            if (!x || !y) return

            const tmpTokenx = new Token({ id: x })
            const tmpTokeny = new Token({ id: y })

            this.setState({
              title: (
                <div className={styles.pairWrapper}>
                  <div className={styles.pair}>
                    <div className={styles.symbol}>
                      {tmpTokenx.tokenContract === 'eosio'
                        ? `${tmpTokenx.tokenSymbol}/`
                        : `${tmpTokenx.tokenSymbol}`}
                    </div>
                    <div className={styles.contract}>
                      {tmpTokenx.tokenContract === 'eosio' ? '' : `@${tmpTokenx.tokenContract}/`}
                    </div>
                  </div>

                  <div className={styles.pair}>
                    <div className={styles.symbol}>{`${tmpTokeny.tokenSymbol}`}</div>
                    <div className={styles.contract}>
                      {tmpTokeny.tokenContract === 'eosio' ? '' : `@${tmpTokeny.tokenContract}`}
                    </div>
                  </div>
                </div>
              ),
            })
          }
        }
      }

      _goto = (pathname, search) => {
        const { history } = this.props

        history.push({
          pathname,
          search,
        })
      }

      render() {
        const { title, hasBackIcon, suffix, suffixIndex } = this.state
        const { match } = this.props

        return (
          <div className={styles.wrapper}>
            <div
              className={
                !suffix ? styles.headWrapper : classnames(styles.headWrapper, styles.withSuffix)
              }>
              {hasBackIcon && (
                <div className={styles.backWrapper}>
                  <Icon
                    className={styles.back}
                    type="left"
                    onClick={() => {
                      window.history.back()
                    }}
                  />
                </div>
              )}
              {suffix && suffixIndex && match.path.indexOf(suffixIndex) >= 0 && (
                <div className={styles.suffixClearfix} />
              )}
              <div className={styles.titleWrapper}>
                <div className={styles.title}>{title}</div>
              </div>
              {suffix && suffixIndex && match.path.indexOf(suffixIndex) >= 0 && (
                <div className={styles.suffixWrapper}>{suffix}</div>
              )}
            </div>
            <div className={styles.content}>
              <WrappedComponent {...this.props} />
            </div>
          </div>
        )
      }
    },
  )
}

export default withBack
