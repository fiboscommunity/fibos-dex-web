import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'
import BigNumber from 'bignumber.js'

import Icon from 'antd/lib/icon'
import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'
import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { withBack } from 'Commons'
import { pollInterval, requestInterval } from 'Config'
import { getStrWithPrecision, contractErrorCollector } from 'Utils'

import TokenTable from './components/token-table'

import styles from './mobile-charge.module.css'

class MobileCharge extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}
    this.searchTimeout = null
  }

  componentDidMount() {
    this.checkAvailable()
  }

  componentDidUpdate(prevProps) {
    const { ironmanData, ironmanReady, changeFieldValue } = this.props

    if (
      (!prevProps.ironmanData && ironmanData) ||
      (!ironmanReady && !prevProps.ironmanReady && ironmanData && prevProps.ironmanData)
    ) {
      changeFieldValue('ironmanReady', true)
      this.checkAvailable(ironmanData)
    }

    const { requestingAvailable } = this.props

    if (
      ironmanData &&
      ironmanData.fibos &&
      !requestingAvailable &&
      requestingAvailable !== prevProps.requestingAvailable
    ) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    if (
      (!ironmanData || !ironmanData.fibos) &&
      prevProps.ironmanData &&
      prevProps.ironmanData.fibos
    ) {
      clearTimeout(this.timeout)
    }
  }

  requestForTokensForSelect = searchValue => {
    const { changeFieldValue, requestForTokensForSelect } = this.props

    changeFieldValue('requestingTokensForSelect', true)

    const reqFuc = () => {
      requestForTokensForSelect(
        {
          search: searchValue || '',
        },
        {
          successCb: () => {
            changeFieldValue('requestingTokensForSelect', false)
            clearTimeout(this.searchTimeout)
          },
          failCb: () => {
            changeFieldValue('requestingTokensForSelect', false)
            clearTimeout(this.searchTimeout)
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

  checkTemporayPairAvailable = callback => {
    const {
      addPairSrcToken,
      addPairDstToken,

      changeFieldValue,
      checkTemporayPairAvailable,
    } = this.props

    changeFieldValue('requestingTemporayAddPairAvailable', true)
    changeFieldValue('temporayAddPairAvailable', false)

    checkTemporayPairAvailable(
      {
        tokenx: addPairSrcToken.id,
        tokeny: addPairDstToken.id,
      },
      {
        successCb: result => {
          changeFieldValue('requestingTemporayAddPairAvailable', false)
          if (callback) {
            callback(result)
          }
        },
        failCb: () => {
          message.error(intl.get('QUERY_FAILED'))
        },
      },
    )
  }

  checkAvailable = ironmanData => {
    if (!ironmanData || !ironmanData.fibos) return

    const {
      fibos,
      account: { name },
    } = ironmanData
    const { changeFieldValue } = this.props

    if (fibos) {
      changeFieldValue('requestingAvailable', true)

      fibos
        .getTableRows({
          json: true,
          code: 'eosio.token',
          scope: name,
          table: 'accounts',
          limit: 5000,
        })
        .then(reponse => {
          const { rows } = reponse
          const result = {}

          rows.forEach(item => {
            const { contract, quantity } = item.balance
            const quantityArr = quantity.split(' ')

            result[`${quantityArr[1]}@${contract}`] = {
              quantity: quantityArr[0],
              symbol: quantityArr[1],
              contract,
            }
          })

          changeFieldValue('tableRowOfAccounts', result)

          this.urlSearchHandler()
        })
        .catch(error => {
          changeFieldValue('requestingAvailable', false)
          throw new Error(error)
        })
    }
  }

  urlSearchHandler = () => {
    const {
      location: { search },

      requestForTokensForSelect,
      changeFieldValue,
    } = this.props

    const { x, y } = queryString.parse(search)

    if (x && y) {
      requestForTokensForSelect(
        {
          search: '',
        },
        {
          successCb: () => {
            changeFieldValue('requestingAvailable', false)

            const { tokensForSelectMap } = this.props

            if (tokensForSelectMap[x] && tokensForSelectMap[y]) {
              changeFieldValue('addPairDstToken', tokensForSelectMap[x])
              changeFieldValue('addPairSrcToken', tokensForSelectMap[y])
            }
          },
          failCb: () => {
            changeFieldValue('requestingAvailable', false)
          },
        },
      )
    }

    changeFieldValue('requestingAvailable', false)
  }

  getAvailable = name => {
    const { tableRowOfAccounts } = this.props

    if (
      !name ||
      !tableRowOfAccounts ||
      Object.keys(tableRowOfAccounts) <= 0 ||
      !tableRowOfAccounts[name]
    ) {
      return 0
    }

    return tableRowOfAccounts[name].quantity
  }

  startPoll = () => {
    const { ironmanData } = this.props
    const { fibos } = ironmanData

    if (!fibos) return

    this.timeout = setTimeout(() => {
      this.checkAvailable(ironmanData)
    }, pollInterval)
  }

  handleComfirm = () => {
    const {
      location: { pathname },

      addPairDstToken,
      addPairSrcToken,
      form: { validateFields },
    } = this.props

    validateFields(['dstTokenAmount', 'srcTokenAmount'], (errors, value) => {
      const { dstTokenAmount, srcTokenAmount } = value
      if (!errors && srcTokenAmount && dstTokenAmount) {
        if (pathname.indexOf('/createpair') >= 0) {
          this.checkTemporayPairAvailable(tmpAvailable => {
            if (tmpAvailable) {
              this.reqCharge(
                `${getStrWithPrecision(srcTokenAmount, addPairSrcToken.tokenPre)} ${
                  addPairSrcToken.id
                }`,
                `${getStrWithPrecision(dstTokenAmount, addPairDstToken.tokenPre)} ${
                  addPairDstToken.id
                }`,
              )
            } else {
              message.error(intl.get('ADD_PAIRS_FAILED'))
            }
          })
        } else if (pathname.indexOf('/reactivationpair') >= 0) {
          this.reqCharge(
            `${getStrWithPrecision(srcTokenAmount, addPairSrcToken.tokenPre)} ${
              addPairSrcToken.id
            }`,
            `${getStrWithPrecision(dstTokenAmount, addPairDstToken.tokenPre)} ${
              addPairDstToken.id
            }`,
          )
        }
      }
    })
  }

  reqCharge = (dstQuantity, srcQuantity) => {
    const {
      match,
      location: { pathname, search },
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
    } = this.props

    if (fibos) {
      const reqData = {
        owner: name,
        tokenx: dstQuantity,
        tokeny: srcQuantity,
      }

      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract
          .addreserves(reqData, {
            authorization,
          })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))

              if (pathname.indexOf('/reactivationpair') >= 0) {
                this._goto(
                  match.path.indexOf('/app') >= 0 ? '/app/exchange' : '/mobile/exchange',
                  search,
                )
              }
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }
          })
          .catch(e => {
            contractErrorCollector(e)
          })
      })
    }

    return true
  }

  _goto = (pathname, search) => {
    const { history } = this.props

    history.push({
      pathname,
      search,
    })
  }

  render() {
    const {
      location: { pathname },

      isSelecting,
      searchValue,

      addPairDstToken,
      addPairDstTokenInput,

      addPairSrcToken,
      addPairSrcTokenInput,

      requestingAddPair,
      requestingTemporayAddPairAvailable,

      changeFieldValue,
      form: { getFieldDecorator },
    } = this.props

    const dstTokenAvailable = this.getAvailable(addPairDstToken.id)
    const srcTokenAvailable = this.getAvailable(addPairSrcToken.id)

    const dstTokenInputDisabled =
      !dstTokenAvailable ||
      new BigNumber(dstTokenAvailable).eq(0) ||
      (addPairDstToken.isSmart && addPairDstToken.position === 0)
    const srcTokenInputDisabled =
      !srcTokenAvailable ||
      new BigNumber(srcTokenAvailable).eq(0) ||
      (addPairSrcToken.isSmart && addPairSrcToken.position === 0)

    const dstTokenAvailableText = addPairDstToken.id
      ? `${intl.get('MOBILE_AVAILABLE')}: ${dstTokenAvailable} ${addPairDstToken.tokenSymbol || ''}`
      : ''

    const srcTokenAvailableText = addPairSrcToken.id
      ? `${intl.get('MOBILE_AVAILABLE')}: ${srcTokenAvailable} ${addPairSrcToken.tokenSymbol || ''}`
      : ''

    return (
      <div className={styles.wrapper}>
        {isSelecting && (
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
              />
            </div>
            <div className={styles.addonWrapper}>
              <div className={styles.cancelBtnWrapper}>
                <div
                  className={styles.cancelBtn}
                  onClick={() => {
                    this.requestForTokensForSelect(searchValue)
                  }}>
                  {intl.get('MOBILE_SEARCH')}
                </div>
                <div
                  className={styles.cancelBtn}
                  onClick={() => {
                    changeFieldValue('isSelecting', false)
                  }}>
                  {intl.get('CANCEL')}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={styles.content}>
          {isSelecting && <TokenTable />}
          {!isSelecting && (
            <div className={styles.cardWrapper}>
              <div className={styles.cardTitleWrapper}>
                <div className={styles.cardTitle}>{intl.get('TOKEN_FIRST')}</div>
              </div>
              <div
                className={styles.TokenWrapper}
                onClick={() => {
                  if (pathname.indexOf('/createpair') >= 0) {
                    changeFieldValue('isSelecting', true)
                    changeFieldValue('selectingToken', 'dst')
                  }
                }}>
                <div className={styles.selectTokenLabel}>{intl.get('SELECT_TOKEN')}</div>
                <div className={styles.selectTokenWrapper}>
                  <div className={styles.pairWrapper}>
                    <div className={styles.pair}>
                      <div className={styles.symbol}>{`${addPairDstToken.tokenSymbol || ''}`}</div>
                      <div className={styles.contract}>
                        {addPairDstToken.tokenContract === 'eosio' || !addPairDstToken.tokenContract
                          ? ''
                          : `@${addPairDstToken.tokenContract}`}
                      </div>
                    </div>
                  </div>

                  {pathname.indexOf('/createpair') >= 0 && (
                    <div className={styles.toSelectWrapper}>
                      <Icon className={styles.toSelect} type="right" />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.amountWrapper}>
                <div className={styles.amountLabel}>{intl.get('MOBILE_TRADE_AMOUNT')}</div>
                <div className={styles.amountInputWrapper}>
                  <Form>
                    <Form.Item>
                      {getFieldDecorator('dstTokenAmount', {
                        initialValue: addPairDstTokenInput,
                        validateFirst: true,
                        rules: [
                          {
                            validator: (rule, value, callback) => {
                              if (!value || Number.isNaN(Number(value))) {
                                return callback('')
                                // return callback(intl.get('TRADE_PANEL_INFO2'))
                              }

                              return callback()
                            },
                          },
                          {
                            validator: (rule, value, callback) => {
                              if (value && new BigNumber(value).lte(0)) {
                                return callback('')
                                // return callback(intl.get('TRADE_PANEL_INFO3'))
                              }

                              return callback()
                            },
                          },
                          {
                            validator: (rule, value, callback) => {
                              if (
                                dstTokenAvailable &&
                                value &&
                                new BigNumber(dstTokenAvailable).lt(value)
                              ) {
                                return callback('')
                                // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
                              }

                              return callback()
                            },
                          },
                        ],
                      })(
                        <Input
                          className={styles.amountInput}
                          allowClear
                          placeholder={
                            dstTokenInputDisabled
                              ? intl.get('CAN_NOT_TRADE')
                              : intl.get('INPUT_AMOUNT')
                          }
                          autoComplete="off"
                          onChange={e => {
                            changeFieldValue('addPairDstTokenInput', e.target.value)
                          }}
                          onBlur={e => {
                            if (
                              addPairDstToken &&
                              addPairDstToken.id &&
                              !Number.isNaN(e.target.value) &&
                              new BigNumber(e.target.value).gt(0)
                            ) {
                              changeFieldValue(
                                'addPairDstTokenInput',
                                getStrWithPrecision(e.target.value, addPairDstToken.tokenPre),
                              )
                            }

                            window.scrollTo(100, 0)
                          }}
                          disabled={dstTokenInputDisabled}
                        />,
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </div>
              <div className={styles.availableWrapper}>
                <div className={styles.available}>{dstTokenAvailableText}</div>
              </div>
            </div>
          )}
          {!isSelecting && (
            <div className={styles.cardWrapper}>
              <div className={styles.cardTitleWrapper}>
                <div className={styles.cardTitle}>{intl.get('TOKEN_SECOND')}</div>
              </div>
              <div
                className={styles.TokenWrapper}
                onClick={() => {
                  if (pathname.indexOf('/createpair') >= 0) {
                    changeFieldValue('isSelecting', true)
                    changeFieldValue('selectingToken', 'src')
                  }
                }}>
                <div className={styles.selectTokenLabel}>{intl.get('SELECT_TOKEN')}</div>
                <div className={styles.selectTokenWrapper}>
                  <div className={styles.pairWrapper}>
                    <div className={styles.pair}>
                      <div className={styles.symbol}>{`${addPairSrcToken.tokenSymbol || ''}`}</div>
                      <div className={styles.contract}>
                        {addPairSrcToken.tokenContract === 'eosio' || !addPairSrcToken.tokenContract
                          ? ''
                          : `@${addPairSrcToken.tokenContract}`}
                      </div>
                    </div>
                  </div>

                  {pathname.indexOf('/createpair') >= 0 && (
                    <div className={styles.toSelectWrapper}>
                      <Icon className={styles.toSelect} type="right" />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.amountWrapper}>
                <div className={styles.amountLabel}>{intl.get('MOBILE_TRADE_AMOUNT')}</div>
                <div className={styles.amountInputWrapper}>
                  <Form>
                    <Form.Item>
                      {getFieldDecorator('srcTokenAmount', {
                        initialValue: addPairSrcTokenInput,
                        validateFirst: true,
                        rules: [
                          {
                            validator: (rule, value, callback) => {
                              if (!value || Number.isNaN(Number(value))) {
                                return callback('')
                                // return callback(intl.get('TRADE_PANEL_INFO2'))
                              }

                              return callback()
                            },
                          },
                          {
                            validator: (rule, value, callback) => {
                              if (value && new BigNumber(value).lte(0)) {
                                return callback('')
                                // return callback(intl.get('TRADE_PANEL_INFO3'))
                              }

                              return callback()
                            },
                          },
                          {
                            validator: (rule, value, callback) => {
                              if (
                                srcTokenAvailable &&
                                value &&
                                new BigNumber(srcTokenAvailable).lt(value)
                              ) {
                                return callback('')
                                // return callback(intl.get('AVAILABLE_NOT_ENOUGH'))
                              }

                              return callback()
                            },
                          },
                        ],
                      })(
                        <Input
                          className={styles.amountInput}
                          allowClear
                          placeholder={
                            srcTokenInputDisabled
                              ? intl.get('CAN_NOT_TRADE')
                              : intl.get('INPUT_AMOUNT')
                          }
                          autoComplete="off"
                          onChange={e => {
                            changeFieldValue('addPairSrcTokenInput', e.target.value)
                          }}
                          onBlur={e => {
                            if (
                              addPairSrcToken &&
                              addPairSrcToken.id &&
                              !Number.isNaN(e.target.value) &&
                              new BigNumber(e.target.value).gt(0)
                            ) {
                              changeFieldValue(
                                'addPairSrcTokenInput',
                                getStrWithPrecision(e.target.value, addPairSrcToken.tokenPre),
                              )
                            }

                            window.scrollTo(100, 0)
                          }}
                          disabled={srcTokenInputDisabled}
                        />,
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </div>
              <div className={styles.availableWrapper}>
                <div className={styles.available}>{srcTokenAvailableText}</div>
              </div>
            </div>
          )}
          {!isSelecting && (
            <div className={styles.cofirmBtnWrapper}>
              <Button
                className={styles.cofirmBtn}
                type="primary"
                key="cofirm"
                loading={requestingAddPair || requestingTemporayAddPairAvailable}
                disabled={
                  !addPairDstToken.id ||
                  !addPairDstTokenInput ||
                  !addPairSrcToken.id ||
                  !addPairSrcTokenInput ||
                  requestingTemporayAddPairAvailable
                }
                onClick={this.handleComfirm}>
                {pathname.indexOf('/createpair') >= 0
                  ? intl.get('ADD_PAIRS_COMFIRM')
                  : intl.get('RESTART_PAIRS_COMFIRM')}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const MobileChargeWithForm = Form.create({
  name: 'addPairs',
  onValuesChange: () => {},
  onFieldsChange: (props, changedValues) => {
    const { changeFieldValue } = props

    if (changedValues.dstTokenAmount) {
      const { dirty, errors, name, touched, validating } = changedValues.dstTokenAmount
      changeFieldValue('addPairDstTokenInputObj', {
        dirty,
        errors,
        name,
        touched,
        validating,
      })
    }

    if (changedValues.srcTokenAmount) {
      const { dirty, errors, name, touched, validating } = changedValues.srcTokenAmount
      changeFieldValue('addPairSrcTokenInputObj', {
        dirty,
        errors,
        name,
        touched,
        validating,
      })
    }
  },
  mapPropsToFields(props) {
    return {
      dstTokenAmount: Form.createFormField({
        value: props.addPairDstTokenInput,
        ...props.addPairDstTokenInputObj,
      }),
      srcTokenAmount: Form.createFormField({
        value: props.addPairSrcTokenInput,
        ...props.addPairSrcTokenInputObj,
      }),
    }
  },
})(MobileCharge)

export default withRouter(withBack(MobileChargeWithForm))
