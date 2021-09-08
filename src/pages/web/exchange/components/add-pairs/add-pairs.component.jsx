import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'
import BigNumber from 'bignumber.js'

import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'
import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'
import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { getStrWithPrecision, contractErrorCollector } from 'Utils'

import styles from './add-pairs.module.css'

const { Option } = Select

class AddPairs extends PureComponent {
  componentDidUpdate(prevProps /* , prevState */) {
    const {
      addPairModalShow,
      resetAddPairs,
      requestForTokensForSelect,
      changeFieldValue,
    } = this.props

    if (!addPairModalShow && prevProps.addPairModalShow) {
      resetAddPairs()
    }

    if (addPairModalShow && !prevProps.addPairModalShow) {
      requestForTokensForSelect({
        successCb: () => {
          changeFieldValue('requestingTokensForSelect', false)
        },
        failCb: () => {
          changeFieldValue('requestingTokensForSelect', false)
        },
      })
    }
  }

  checkTokenVal = (target, toCompare) => {
    const unavailable =
      (target.tokenName && toCompare.tokenName === target.tokenName) ||
      (target.isSmart && !toCompare.isSmart && toCompare.tokenName === target.cwToken) ||
      (target.isSmart && toCompare.isSmart && toCompare.cwToken === target.cwToken) ||
      (!target.isSmart && toCompare.isSmart && toCompare.cwToken === target.tokenName)

    return unavailable
  }

  reqCharge = (dstQuantity, srcQuantity) => {
    const {
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
              this.handleCancel()
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
        tokenx: addPairSrcToken.tokenName,
        tokeny: addPairDstToken.tokenName,
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

  handleComfirm = () => {
    const {
      addPairDstToken,
      addPairSrcToken,
      addPairType,
      form: { validateFields },
    } = this.props

    validateFields(['dstTokenAmount', 'srcTokenAmount'], (errors, value) => {
      const { dstTokenAmount, srcTokenAmount } = value
      if (!errors && srcTokenAmount && dstTokenAmount) {
        if (addPairType === 'create') {
          this.checkTemporayPairAvailable(tmpAvailable => {
            if (tmpAvailable) {
              this.reqCharge(
                `${getStrWithPrecision(srcTokenAmount, addPairSrcToken.pre)} ${
                  addPairSrcToken.tokenName
                }`,
                `${getStrWithPrecision(dstTokenAmount, addPairDstToken.pre)} ${
                  addPairDstToken.tokenName
                }`,
              )
            } else {
              message.error(intl.get('ADD_PAIRS_FAILED'))
            }
          })
        } else if (addPairType === 'restart') {
          this.reqCharge(
            `${getStrWithPrecision(srcTokenAmount, addPairSrcToken.pre)} ${
              addPairSrcToken.tokenName
            }`,
            `${getStrWithPrecision(dstTokenAmount, addPairDstToken.pre)} ${
              addPairDstToken.tokenName
            }`,
          )
        }
      }
    })
  }

  handleCancel = () => {
    const { changeFieldValue } = this.props

    changeFieldValue('addPairModalShow', false)
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

  render() {
    const {
      requestingTokensForSelect,
      requestingAddPair,
      addPairModalShow,
      addPairType,
      addPairDstToken,
      addPairDstTokenName,
      addPairDstTokenInput,
      addPairSrcToken,
      addPairSrcTokenName,
      addPairSrcTokenInput,

      requestingTemporayAddPairAvailable,

      changeFieldValue,
      form: { getFieldDecorator },

      tokensForSelect,
    } = this.props

    const dstTokenAvailable = this.getAvailable(addPairDstToken.tokenName)
    const srcTokenAvailable = this.getAvailable(addPairSrcToken.tokenName)

    const footer = (
      <div className={styles.footerWrapper}>
        <Button
          className={styles.cofirmBtn}
          key="cofirm"
          loading={requestingAddPair || requestingTemporayAddPairAvailable}
          disabled={
            !addPairDstTokenName ||
            !addPairDstTokenInput ||
            !addPairSrcTokenName ||
            !addPairSrcTokenInput ||
            requestingTemporayAddPairAvailable
          }
          onClick={this.handleComfirm}>
          {addPairType === 'create'
            ? intl.get('ADD_PAIRS_COMFIRM')
            : intl.get('RESTART_PAIRS_COMFIRM')}
        </Button>
        <Button className={styles.cancelBtn} key="cancel" onClick={this.handleCancel}>
          {intl.get('CANCEL')}
        </Button>
      </div>
    )

    return (
      <Modal
        width={600}
        destroyOnClose
        wrapClassName={styles.wrapper}
        centered
        closable={false}
        maskClosable={false}
        title={addPairType === 'create' ? intl.get('ADD_PAIRS') : intl.get('RESTART_PAIRS')}
        visible={addPairModalShow}
        onCancel={this.handleCancel}
        footer={footer}>
        <div className={styles.inputTitleWrapper}>
          <div className={styles.inputTitle}>{intl.get('ADD_PAIRS_DSTTOKEN_TITLE')}</div>
        </div>
        <div className={styles.formWrapper}>
          <div className={styles.selectWrapper} id={styles.addPairDstTokenName}>
            <Select
              className={styles.select}
              disabled={requestingTokensForSelect || addPairType !== 'create'}
              dropdownMatchSelectWidth={false}
              showSearch
              style={{ width: 200 }}
              placeholder={intl.get('ADD_PAIRS_TOKENNAME_PLACEHOLDER')}
              optionFilterProp="data"
              value={addPairDstTokenName}
              onChange={(val, option) => {
                if (val && option) {
                  const { props } = option
                  const { data } = props

                  changeFieldValue('addPairDstToken', data)
                  changeFieldValue('addPairDstTokenName', val)
                } else {
                  changeFieldValue('addPairDstToken', {
                    symbol: '',
                    contract: '',
                    tokenName: '',
                    position: 0,
                    pre: 0,
                  })
                  changeFieldValue('addPairDstTokenName', undefined)
                }
              }}
              filterOption={(input, option) => {
                const tmpInputed = input.toLowerCase()
                const optionVal = option.props.data.tokenName.toLowerCase()

                return optionVal.indexOf(tmpInputed) >= 0
              }}
              allowClear
              dropdownClassName={styles.dropdown}
              defaultActiveFirstOption={false}
              notFoundContent={intl.get('RACORD_NO_SEARCH_DATA')}
              getPopupContainer={() => document.getElementById(styles.addPairDstTokenName)}>
              {tokensForSelect.map(item => {
                const { tokenName } = item

                const disabled = this.checkTokenVal(addPairSrcToken, item)

                return (
                  <Option key={tokenName} disabled={disabled} value={tokenName} data={item}>
                    {tokenName}
                  </Option>
                )
              })}
            </Select>
            {requestingTokensForSelect && (
              <Icon type="loading" className={styles.inputFormWrapper} />
            )}
          </div>
          <div className={styles.inputFormWrapper}>
            <div className={styles.inputWrapper}>
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
                      className={styles.input}
                      placeholder={intl.get('ADD_PAIRS_AMOUNT_PLACEHOLDER')}
                      autoComplete="off"
                      disabled={
                        !dstTokenAvailable ||
                        new BigNumber(dstTokenAvailable).eq(0) ||
                        (addPairDstToken.isSmart && addPairDstToken.position === 0)
                      }
                      onChange={e => {
                        changeFieldValue('addPairDstTokenInput', e.target.value)
                      }}
                      suffix={addPairDstToken.symbol || ''}
                    />,
                  )}
                </Form.Item>
              </Form>
            </div>
            <div className={styles.available}>
              {addPairDstToken.symbol
                ? `${intl.get('AVAILABLE')} ${dstTokenAvailable} ${addPairDstToken.symbol}`
                : intl.get('ASK_FOR_SELECTING_TOKEN')}
            </div>
          </div>
        </div>
        <div className={styles.inputTitleWrapper}>
          <div className={styles.inputTitle}>{intl.get('ADD_PAIRS_SRCTOKEN_TITLE')}</div>
        </div>
        <div className={styles.formWrapper}>
          <div className={styles.selectWrapper}>
            <Select
              className={styles.select}
              disabled={requestingTokensForSelect || addPairType !== 'create'}
              dropdownMatchSelectWidth={false}
              showSearch
              style={{ width: 200 }}
              placeholder={intl.get('ADD_PAIRS_TOKENNAME_PLACEHOLDER')}
              optionFilterProp="data"
              value={addPairSrcTokenName}
              onChange={(val, option) => {
                if (val && option) {
                  const { props } = option
                  const { data } = props

                  changeFieldValue('addPairSrcToken', data)
                  changeFieldValue('addPairSrcTokenName', val)
                } else {
                  changeFieldValue('addPairSrcToken', {
                    symbol: '',
                    contract: '',
                    tokenName: '',
                    position: 0,
                    pre: 0,
                  })
                  changeFieldValue('addPairSrcTokenName', undefined)
                }
              }}
              filterOption={(input, option) => {
                const tmpInputed = input.toLowerCase()
                const optionVal = option.props.data.tokenName.toLowerCase()

                return optionVal.indexOf(tmpInputed) >= 0
              }}
              allowClear
              dropdownClassName={styles.dropdown}
              defaultActiveFirstOption={false}
              notFoundContent={intl.get('RACORD_NO_SEARCH_DATA')}
              getPopupContainer={() => document.getElementById(styles.addPairDstTokenName)}>
              {tokensForSelect.map(item => {
                const { tokenName } = item

                const disabled = this.checkTokenVal(addPairDstToken, item)

                return (
                  <Option key={tokenName} disabled={disabled} value={tokenName} data={item}>
                    {tokenName}
                  </Option>
                )
              })}
            </Select>
            {requestingTokensForSelect && (
              <Icon type="loading" className={styles.inputFormWrapper} />
            )}
          </div>
          <div className={styles.inputFormWrapper}>
            <div className={styles.inputWrapper}>
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
                      className={styles.input}
                      placeholder={intl.get('ADD_PAIRS_AMOUNT_PLACEHOLDER')}
                      autoComplete="off"
                      disabled={
                        !srcTokenAvailable ||
                        new BigNumber(srcTokenAvailable).eq(0) ||
                        (addPairDstToken.isSmart && addPairDstToken.position === 0)
                      }
                      onChange={e => {
                        changeFieldValue('addPairSrcTokenInput', e.target.value)
                      }}
                      suffix={addPairSrcToken.symbol || ''}
                    />,
                  )}
                </Form.Item>
              </Form>
            </div>
            <div className={styles.available}>
              {addPairSrcToken.symbol
                ? `${intl.get('AVAILABLE')} ${srcTokenAvailable} ${addPairSrcToken.symbol}`
                : intl.get('ASK_FOR_SELECTING_TOKEN')}
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

const AddPairsForm = Form.create({
  name: 'addPairs',
  onValuesChange: () => {},
})(AddPairs)

export default AddPairsForm
