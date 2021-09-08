import React, { PureComponent } from 'react'

import { withRouter } from 'react-router'

import QRcode from 'qrcode.react'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import intl from 'react-intl-universal'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'
import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'
import AutoComplete from 'antd/lib/auto-complete'
import 'antd/lib/auto-complete/style/css'
import notification from 'antd/lib/notification'
import 'antd/lib/notification/style/css'

import { contractErrorCollector } from 'Utils'
import { SpinWrapper } from 'Components'

import noData from 'Assets/commons/noData.png'
import imTokenLogo from 'Assets/home/imTokenLogo.svg'
import styles from './capital-table.module.css'

const tokenContracts = {
  FOETH: '',
  FOUSDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  FODAI: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
  FOUSDK: '0x1c48f86ae57291f7686349f12601910bd8d470bb',
}

// const ETHContract = '0xb1b9dbd0998f2fd8f966e74fcf6a5ef40702ad1d'
const ETHContract = '0x8cbd6dFDD2Cc917793746613A648c600AFB020b1'
const ETHAddressLength = 40
const identifycodeLength = 8
const waitTime = 600

class CapitalTable extends PureComponent {
  constructor(props, context) {
    super(props, context)
    this.state = {
      countDown: null,
    }
    this.timerForCount = null
    this.timerForReq = null
  }

  componentDidMount() {
    const { ironmanData, changeFieldValue } = this.props
    if (ironmanData) {
      this.requestForAsset(() => {
        changeFieldValue('capitalSpinning', false)
        this.reqFeeRate()
      })
    }
  }

  componentDidUpdate(prevProps) {
    const {
      ironmanData,
      requestingAsset,
      changeFieldValue,
      ethAddress,
      requestingContract,
    } = this.props
    if (ironmanData && !prevProps.ironmanData) {
      this.requestForAsset(() => {
        changeFieldValue('capitalSpinning', false)
        this.reqFeeRate()
      })
    }

    if (requestingAsset !== prevProps.requestingAsset) {
      clearTimeout(this.timerForReq)
      this.timerForReq = setTimeout(() => {
        this.requestForAsset()
      }, 15000)
    }

    if (ethAddress.length !== prevProps.ethAddress.length) {
      this.changeModalVisible('chargeModalVisible', false)
    }

    if (requestingContract !== prevProps.requestingContract) {
      if (requestingContract) {
        this.openNotificationOfRequestingContract()
      } else {
        this.closeNotificationOfRequestingContract()
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timerForCount)
    clearTimeout(this.timerForReq)
  }

  requestForAsset = callback => {
    const {
      ironmanData,
      getAsset,
      getVerifyCode,
      changeFieldValue,
      overTimeNotificationVisible,
      tokenFilter,
    } = this.props
    changeFieldValue('requestingAsset', true)
    if (ironmanData) {
      getAsset(
        { account: ironmanData.account.name },
        {
          successCb: capitalTableData => {
            if (tokenFilter !== '') {
              const result = capitalTableData.filter(item => item.token.indexOf(tokenFilter) > -1)
              changeFieldValue('capitalTableData', result)
            }
            changeFieldValue('requestingAsset', false)
            this.reqVerify({
              successCb: () => {
                // close overtime notice
                this.closeNotificationOfRequestingVerifyCode()
              },
              failCb: () => {
                // req for verify from server
                // if verify overtime => open overtime notice
                // if verify success => close overtime notice
                getVerifyCode(
                  { account: ironmanData.account.name },
                  {
                    successCb: result => {
                      const { status } = result
                      if (status === '1' && overTimeNotificationVisible) {
                        this.openNotificationOfRequestingVerifyCode()
                      } else {
                        this.closeNotificationOfRequestingVerifyCode()
                      }
                    },
                  },
                )
              },
            })
            if (callback) {
              callback()
            }
          },
          failCb: () => {
            changeFieldValue('requestingAsset', false)
            if (callback) {
              callback()
            }
          },
        },
      )
    }
  }

  countDown = () => {
    const { expiredTime } = this.props
    let maxTime = expiredTime
    const _this = this
    this.setState(
      {
        countDown: maxTime,
      },
      () => {
        setTimeout(function count() {
          maxTime -= 1
          if (maxTime >= 0) {
            _this.setState({
              countDown: maxTime,
            })
            _this.timerForCount = setTimeout(count, 1000)
          } else {
            clearTimeout(_this.timerForCount)
            _this.changeModalVisible('chargeModalVisible', false)
          }
        }, 1000)
      },
    )
  }

  openNotificationOfRequestingVerifyCode = () => {
    const { changeFieldValue } = this.props
    notification.info({
      key: 'REQUESTING_VERIFYCODE',
      message: intl.get('VERIFYCODE_TIPS_OVERTIME'),
      duration: null,
      placement: 'bottomLeft',
      onClose: () => {
        changeFieldValue('overTimeNotificationVisible', false)
      },
    })
  }

  closeNotificationOfRequestingVerifyCode = () => {
    notification.close('REQUESTING_VERIFYCODE')
  }

  openNotificationOfRequestingContract = () => {
    notification.info({
      key: 'REQUESTING_CONTRACT',
      message: intl.get('REQUESTING_CONTRACT'),
      duration: null,
      placement: 'bottomLeft',
    })
  }

  closeNotificationOfRequestingContract = () => {
    notification.close('REQUESTING_CONTRACT')
  }

  openExpandedRowKey = (record, type) => {
    const { changeFieldValue, form } = this.props
    const { resetFields } = form
    const { id, token } = record
    const tmp = [...id]
    resetFields()
    changeFieldValue('expandedRowKeys', tmp)
    changeFieldValue('formType', type)
    changeFieldValue('selectToken', token)
  }

  getColumns = () => [
    {
      title: intl.get('TOKEN_TYPE'),
      dataIndex: 'token',
      key: 'token',
      render: col => {
        if (col) {
          return <div>{col}</div>
        }
        return null
      },
    },
    {
      title: intl.get('AVAILABLE'),
      dataIndex: 'available',
      key: 'available',
      render: col => {
        if (col) {
          return <div>{col}</div>
        }
        return null
      },
    },
    {
      title: intl.get('ACTIONS'),
      key: 'action',
      render: (col, record) => (
        <>
          {Object.keys(tokenContracts).indexOf(record.token) > -1 ? (
            <>
              <Button
                className={styles.detailBtn}
                onClick={() => {
                  this.openExpandedRowKey(record, 'charge')
                }}
              >
                {intl.get('CROSS_CHARGE')}
              </Button>
              <Button
                className={styles.detailBtn}
                onClick={() => {
                  this.openExpandedRowKey(record, 'draw')
                }}
              >
                {intl.get('CROSS_DRAW')}
              </Button>
            </>
          ) : null}
        </>
      ),
    },
  ]

  reqFeeRate = () => {
    const {
      ironmanData: { fibos },
      changeFieldValue,
    } = this.props

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      fibos
        .getTableRows({
          json: true,
          code: 'eosio.cross',
          scope: 'eosio.cross',
          table: 'tokenmap',
        })
        .then(res => {
          const { rows } = res
          const tokenmap =
            rows &&
            rows.map(item => {
              const symbol = item.symbol && item.symbol.sym && item.symbol.sym.split(',')[1]
              const pre = item.symbol && item.symbol.sym && item.symbol.sym.split(',')[0]
              const feeCeiling =
                item.fee_ceiling &&
                item.fee_ceiling.quantity &&
                item.fee_ceiling.quantity.split(' ')[0]
              const feeFloor =
                item.fee_floor && item.fee_floor.quantity && item.fee_floor.quantity.split(' ')[0]
              return {
                symbol,
                pre,
                ethAddress: item.eth_address,
                feeCeiling,
                feeFloor,
                feeRate: item.fee_rate,
              }
            })
          changeFieldValue('tokenmap', tokenmap)
        })
    }
    return false
  }

  reqVerify = cbs => {
    const {
      ironmanData: {
        fibos,
        account: { name },
      },
    } = this.props

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      fibos
        .getTableRows({
          json: true,
          code: 'eosio.cross',
          scope: 'eosio.cross',
          table: 'identifycode',
          lower_bound: name,
          limit: 1,
        })
        .then(res => {
          const { rows } = res
          if (rows.length < 1 || (rows[0] && rows[0].name !== name)) {
            if (cbs && cbs.failCb) {
              cbs.failCb()
            }
          } else if (cbs && cbs.successCb) {
            cbs.successCb(rows)
          }
        })
    }
    return false
  }

  bindETH = () => {
    const { changeFieldValue } = this.props
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
    } = this.props
    changeFieldValue('qrcodeType', 'bind')
    changeFieldValue('capitalSpinning', true)
    this.reqVerify({
      successCb: rows => {
        this.closeNotificationOfRequestingVerifyCode()
        const eightHours = 8 * 3600
        const timeDifference = parseInt(
          (moment(rows[0].expired_time).unix() + eightHours - new Date().getTime() / 1000).toFixed(
            0,
            1,
          ),
          10,
        )
        changeFieldValue(
          'identifycode',
          (Array(identifycodeLength).join(0) + rows[0].identifying_code).slice(-identifycodeLength),
        )
        changeFieldValue('expiredTime', timeDifference - waitTime)
        changeFieldValue('overTimeNotificationVisible', true)
        if (timeDifference > waitTime) {
          this.changeModalVisible('chargeModalVisible', true)
          this.countDown()
        } else if (timeDifference > 0) {
          message.error(intl.get('VERIFYCODE_ERROR_OVERTIME', { time: timeDifference }))
        } else {
          message.error(intl.get('VERIFYCODE_ERROR'))
        }
        changeFieldValue('requestingContract', false)
        changeFieldValue('capitalSpinning', false)
      },
      failCb: () => {
        changeFieldValue('requestingContract', true)
        fibos.contract('eosio.cross', { requiredFields }).then(contract => {
          contract
            .getcode(
              { name },
              {
                authorization,
              },
            )
            .then(trx => {
              const transactionId = trx.transaction_id
              if (transactionId) {
                message.success(intl.get('ACTION_SUCCESS'))
                this.bindETH()
              } else {
                changeFieldValue('requestingContract', false)
                changeFieldValue('capitalSpinning', false)
                message.error(intl.get('ACTION_FAIL'))
              }
            })
            .catch(e => {
              changeFieldValue('requestingContract', false)
              changeFieldValue('capitalSpinning', false)
              contractErrorCollector(e)
            })
        })
      },
    })
  }

  changeModalVisible = (element, target) => {
    const { changeFieldValue } = this.props
    clearTimeout(this.timerForCount)
    changeFieldValue(element, target)
  }

  handleCharge = () => {
    const { form, changeFieldValue } = this.props
    const { validateFields } = form
    clearTimeout(this.timerForCount)
    validateFields(['crossAmount'], (err, values) => {
      if (err) {
        return
      }
      const chargeAmount = values.crossAmount
      const chargeAmountDec = 0
      changeFieldValue('chargeAmountDec', chargeAmountDec)
      changeFieldValue('chargeAmount', chargeAmount)
      changeFieldValue('chargeModalVisible', true)
    })
  }

  handleDraw = record => {
    const {
      form,
      changeFieldValue,
      ironmanData: {
        fibos,
        account: { name },
      },
    } = this.props
    const { validateFields } = form
    clearTimeout(this.timerForCount)
    validateFields(['crossAmount', 'drawEthAddress'], (err, values) => {
      if (err) {
        return
      }
      const { crossAmount, drawEthAddress } = values
      changeFieldValue('requestingContract', true)
      changeFieldValue('capitalSpinning', true)
      fibos.contract('eosio.token').then(contract => {
        contract
          .extransfer({
            from: name,
            to: 'eosio.cross',
            quantity: `${new BigNumber(crossAmount).toFixed(record.pre, 1)} ${record.token}@${
              record.contract
            }`,
            memo: drawEthAddress.slice(-ETHAddressLength),
          })
          .then(trx => {
            const transactionId = trx.transaction_id
            changeFieldValue('requestingContract', false)
            changeFieldValue('capitalSpinning', false)
            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }
          })
          .catch(e => {
            contractErrorCollector(e)
            changeFieldValue('requestingContract', false)
            changeFieldValue('capitalSpinning', false)
          })
      })
    })
  }

  getExpandedRowRender = record => {
    const {
      formType,
      form,
      ethAddressAccessible,
      changeFieldValue,
      inputValue,
      tokenmap,
      expandedRowKeys,
      ethAddress,
    } = this.props
    const openedExpandRowKey = expandedRowKeys[0]
    const tokenInfo = tokenmap[openedExpandRowKey]
    let fee = '0'
    if (formType === 'draw' && tokenInfo) {
      // calc fee
      const tmpFee = new BigNumber(inputValue[0])
        .multipliedBy(new BigNumber(tokenInfo.feeRate))
        .toFixed(parseInt(tokenInfo.pre, 10), 1)
        .valueOf()
      if (parseFloat(tmpFee) > parseFloat(tokenInfo.feeCeiling)) {
        fee = `${tokenInfo.feeCeiling} ${tokenInfo.symbol}`
      } else if (parseFloat(tmpFee) < parseFloat(tokenInfo.feeFloor)) {
        fee = `${tokenInfo.feeFloor} ${tokenInfo.symbol}`
      } else {
        fee = `${tmpFee === 'NaN' ? tokenInfo.feeFloor : tmpFee} ${tokenInfo.symbol}`
      }
    }

    return (
      <div className={styles.expandedForm}>
        <div className={styles.ethAddressName}>
          <div>{intl.get('ETH_ADDRESS')}</div>
          {formType === 'charge' ? (
            <Button
              className={styles.detailBtn}
              onClick={() => {
                this.bindETH()
              }}
            >
              {ethAddressAccessible ? intl.get('ADD_ADDRESS') : intl.get('TO_BIND')}
            </Button>
          ) : null}
        </div>
        {ethAddressAccessible && formType === 'charge' ? (
          <div className={styles.ethAddressGroup}>
            {ethAddress.map(item => (
              <div key={item} className={styles.ethAddressRadio} value={item}>
                {item}
              </div>
            ))}
          </div>
        ) : null}
        {formType === 'draw' ? (
          <Form>
            <Form.Item>
              {form.getFieldDecorator('drawEthAddress', {
                rules: [
                  {
                    required: true,
                    message: intl.get('DRAW_INPUT_TIPS'),
                  },
                  {
                    pattern: new RegExp(/^(0x){1}[0-9a-fA-F]{40}$/),
                    message: intl.get('ETH_VALIDATE_FAIL'),
                  },
                ],
              })(
                <AutoComplete
                  placeholder={intl.get('DRAW_INPUT_TIPS')}
                  className={styles.inputRow}
                  dataSource={ethAddress}
                />,
              )}
            </Form.Item>
          </Form>
        ) : null}
        <div className={styles.formTitle}>{intl.get('CHARGE_AMOUNT')}</div>
        <Form>
          <Form.Item>
            {form.getFieldDecorator('crossAmount', {
              validateFirst: true,
              rules: [
                {
                  required: true,
                  message: `${intl.get('TYPEIN')}${
                    formType === 'charge' ? intl.get('CROSS_CHARGE') : intl.get('CROSS_DRAW')
                  }${intl.get('AMOUNT')}`,
                },
                {
                  pattern: new RegExp(`^\\d+\\.{0,1}\\d{0,${record.pre}}$`),
                  message: intl.get('PRE_CHECK', { pre: record.pre }),
                },
                {
                  validator: (rule, value, callback) => {
                    if (formType === 'draw') {
                      if (parseFloat(value) > parseFloat(tokenInfo.feeFloor)) {
                        callback()
                      } else {
                        callback(intl.get('FEE_TIPS'))
                      }
                    }
                    if (formType === 'charge') {
                      if (parseFloat(value) > 0) {
                        callback()
                      } else {
                        callback(intl.get('CHARGE_TIPS'))
                      }
                    }
                  },
                },
              ],
            })(<Input className={styles.inputRow} suffix={record.token} autoComplete="off" />)}
          </Form.Item>
        </Form>
        <div className={styles.inputTip}>
          {`${intl.get('MIN_CHARGE_AMOUNT')}: ${new BigNumber(1)
            .div(10 ** record.pre)
            .toString(10)
            .valueOf()} ${record.token}`}
        </div>
        {formType === 'draw' ? (
          <div className={styles.feeTip}>{`${intl.get('FEE')}: ${fee}`}</div>
        ) : null}
        {formType === 'charge' ? (
          <>
            <div className={styles.formTitle}>{intl.get('REMINDER')}</div>
            <div className={styles.imtokenTip}>
              {intl.get('IMTOKEN_TIPS_FIRST')}
              <img src={imTokenLogo} alt="imtoken" />
              {intl.get('IMTOKEN_TIPS_SECOND')}
              <img src={imTokenLogo} alt="imtoken" />
              {intl.get('IMTOKEN_TIPS_THRID')}
              <a
                className={styles.crossfoLogo}
                href="https://cross.fo"
                target="_blank"
                rel="noopener noreferrer"
              >
                cross.fo
              </a>
              {intl.get('TRANSFER')}
            </div>
            <Button
              className={styles.submitBtn}
              type="primary"
              disabled={!ethAddressAccessible}
              onClick={() => {
                changeFieldValue('qrcodeType', 'charge')
                this.handleCharge(record)
              }}
            >
              {intl.get('CROSS_CHARGE_BUTTON')}
            </Button>
          </>
        ) : (
          <div>
            <Button
              className={styles.submitBtn}
              // disabled={!ethAddressAccessible}
              type="primary"
              onClick={() => {
                this.handleDraw(record)
              }}
            >
              {intl.get('CROSS_DRAW_BUTTON')}
            </Button>
          </div>
        )}
      </div>
    )
  }

  render() {
    const {
      capitalTableData,
      expandedRowKeys,
      chargeModalVisible,
      qrcodeType,
      identifycode,
      capitalSpinning,
      chargeAmount,
      chargeAmountDec,
      selectToken,
    } = this.props

    const { countDown } = this.state
    return (
      <div className={styles.wrapper}>
        {/* <Modal
          centered
          onCancel={() => {
            this.changeModalVisible('addressModalVisible', false)
          }}
          visible={addressModalVisible}
          className={styles.addressModal}
          destroyOnClose
          footer={null}
          closable={null}
        >
        </Modal> */}

        <Modal
          centered
          onCancel={() => {
            this.changeModalVisible('chargeModalVisible', false)
          }}
          visible={chargeModalVisible}
          className={styles.chargeModal}
          footer={null}
        >
          <QRcode
            className={styles.qrcode}
            value={`ethereum:${ETHContract}?${
              selectToken && qrcodeType === 'charge' && tokenContracts[selectToken]
                ? `contractAddress=${tokenContracts[selectToken]}&`
                : ''
            }decimal=${qrcodeType === 'charge' ? chargeAmountDec : '18'}&value=${
              qrcodeType === 'charge' ? chargeAmount : identifycode
            }`}
          />
          <div className={styles.chargeTips}>
            <div>{intl.get('CROSS_CHARGE_TIP')}</div>
            {qrcodeType === 'bind' ? (
              <>
                <div>{intl.get('BIND_TIP')}</div>
                <div>{`0.0000000000${identifycode} ${intl.get('ETH_FEE')}`}</div>
                <div className={styles.countDown}>
                  {`${intl.get('CHARGE_LIMIT_TIME')}`}
                  <div>{` ${countDown}s`}</div>
                </div>
              </>
            ) : null}
          </div>
        </Modal>
        <SpinWrapper spinning={capitalSpinning}>
          <Table
            className={styles.table}
            rowKey={record => `${record.id}`}
            bordered={false}
            columns={this.getColumns()}
            dataSource={capitalTableData}
            pagination={false}
            expandIconColumnIndex={-1}
            expandIconAsCell={false}
            expandedRowRender={this.getExpandedRowRender}
            expandedRowKeys={expandedRowKeys}
            locale={{
              emptyText: (
                <div className={styles.noDataWrapper}>
                  <div className={styles.noDataImgWrapper}>
                    <img className={styles.noDataImg} src={noData} alt="" />
                  </div>
                  <div className={styles.noDataText}>{intl.get('MARKET_NO_DATA')}</div>
                </div>
              ),
            }}
          />
        </SpinWrapper>
      </div>
    )
  }
}

const CapitalTableForm = Form.create({
  name: 'chargeAndDraw',
  onValuesChange: (props, changedValues) => {
    const { changeFieldValue } = props
    const { crossAmount } = changedValues
    if (crossAmount) {
      changeFieldValue('inputValue', crossAmount)
    }
  },
})(CapitalTable)

export default withRouter(CapitalTableForm)
