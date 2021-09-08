import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import Fo from 'fibos.js'
import { chainId, foNetwork } from 'Config'

import 'intl/locale-data/jsonp/zh'
import zhCN from 'Locales/zh-CN.json'

const locales = {
  'zh-CN': zhCN,
}

// eslint-disable-next-line arrow-body-style
const withScatter = WrappedComponent => {
  return class withScatterCompo extends PureComponent {
    constructor(props) {
      super(props)
      this.state = {}
    }

    componentDidMount() {
      this.initLoadLocales()

      try {
        const { ironman } = this.props

        if (!ironman) {
          this.attachIronMan(() => {
            this.attachIronmanData()
          })
        }
      } catch (e) {
        const { changeFieldValue } = this.props

        changeFieldValue('ironmanError', true)
      }
    }

    attachIronMan = cb => {
      const { changeFieldValue } = this.props
      let extensionLoaded = false

      document.addEventListener('ironmanLoaded', () => {
        if (extensionLoaded) return
        extensionLoaded = true
        changeFieldValue('ironman', window.ironman)

        if (window.fowallet) {
          window.fowallet.disableGestureBack(false)
        }

        if (!window.fowallet) {
          window.ironman = null
        }

        if (cb) {
          cb()
        }
      })

      document.addEventListener('scatterLoaded', () => {
        if (extensionLoaded) return
        extensionLoaded = true
        changeFieldValue('ironman', window.ironman)

        if (!window.fowallet) {
          window.ironman = null
        }

        if (cb) {
          cb()
        }
      })

      setTimeout(() => {
        const { ironman } = this.props

        if (!ironman) changeFieldValue('ironmanMissing', true)
      }, 3000)
    }

    attachIronmanData = () => {
      const { ironman, changeFieldValue } = this.props

      if (ironman) {
        // ironman.requireVersion(1.2)
        // ironman.suggestNetwork(foNetwork)

        ironman
          .getIdentity({
            accounts: [foNetwork],
          })
          .then(identity => {
            const account = identity.accounts.find(acc => acc.blockchain === 'fibos')

            const { name, authority } = account

            // authorization: [`${name}@${authority}`],
            const authorization = [
              {
                actor: name,
                permission: authority,
              },
            ]

            const fibos = ironman.fibos(
              foNetwork,
              Fo,
              {
                authorization,
                broadcast: true,
                chainId,
              },
              foNetwork.protocol,
            )

            const requiredFields = {
              accounts: [foNetwork],
            }

            fibos
              .getAccount(name)
              .then(trx => {
                const { permissions } = trx

                const pubKeys = []

                permissions.forEach(item => {
                  if (!!item.perm_name && item.perm_name === authority) {
                    const { threshold, keys } = item.required_auth

                    keys.find(v => {
                      if (v.weight >= threshold) {
                        return pubKeys.push(v)
                      }

                      return null
                    })
                  }
                })

                const tmp = {
                  foNetwork,
                  fibos,
                  requiredFields,
                  identity,
                  account: {
                    ...account,
                    pubKeys,
                  },
                  authorization,
                }

                changeFieldValue('ironmanData', tmp)
                changeFieldValue('ironmanError', false)
                changeFieldValue('ironmanMissing', false)
              })
              .catch(() => {
                changeFieldValue('ironmanError', true)
              })
          })
          .catch(e => {
            if (!!e && !!e.type && !!e.isError) {
              if (e.type === 'identity_rejected') {
                message.warning(intl.get('USER_DENIE'))
              } else {
                changeFieldValue('ironmanError', true)
              }
            }
          })
      } else {
        changeFieldValue('ironmanError', true)
      }
    }

    initLoadLocales() {
      const { currentLang, changeFieldValue } = this.props

      intl
        .init({
          currentLocale: currentLang,
          locales,
        })
        .then(() => {
          changeFieldValue('initLocalesDone', true)
        })
    }

    render() {
      return (
        <WrappedComponent
          attachIronMan={this.attachIronMan}
          attachIronmanData={this.attachIronmanData}
          {...this.props}
        />
      )
    }
  }
}

export default withScatter
