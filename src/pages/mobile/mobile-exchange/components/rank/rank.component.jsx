import React, { PureComponent } from 'react'
import intl from 'react-intl-universal'

import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import Switch from 'antd/lib/switch'
import 'antd/lib/switch/style/css'
import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

import { SpinWrapper, LockIcon } from 'Components'
import { pollInterval } from 'Config'
import { getStrWithPrecision, contractErrorCollector } from 'Utils'

import styles from './rank.module.css'

class Rank extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.timeout = null
  }

  componentDidMount() {
    const { srcToken, dstToken, changeFieldValue } = this.props

    if (srcToken && srcToken.tokenName && dstToken && dstToken.tokenName) {
      changeFieldValue('spinningRank', true)
      this.getSwapRank(srcToken, dstToken)
    }
  }

  componentDidUpdate(prevProps) {
    const { srcToken, dstToken, rankTab, ironmanData, changeFieldValue } = this.props
    if (
      (dstToken.tokenName &&
        srcToken.tokenName &&
        (prevProps.dstToken.tokenName !== dstToken.tokenName ||
          prevProps.srcToken.tokenName !== srcToken.tokenName)) ||
      prevProps.rankTab !== rankTab ||
      prevProps.ironmanData !== ironmanData
    ) {
      changeFieldValue('spinningRank', true)
      this.getSwapRank(srcToken, dstToken)
    }

    const { requestingRank } = this.props

    if (
      (!requestingRank && requestingRank !== prevProps.requestingRank) ||
      (prevProps.rankTab !== rankTab && rankTab === 'rank')
    ) {
      clearTimeout(this.timeout)
      this.startPoll()
    }

    if (prevProps.rankTab !== rankTab && rankTab === 'total') {
      clearTimeout(this.timeout)
    }

    if (!ironmanData && rankTab === 'my') {
      changeFieldValue('rankTab', 'total')
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  getSwapRank = (srcToken, dstToken) => {
    const { getSwapRank, ironmanData, changeFieldValue } = this.props

    let tmpName = ''

    if (ironmanData && ironmanData.account && ironmanData.account.name) {
      tmpName = ironmanData.account.name
    }

    changeFieldValue('requestingRank', true)
    getSwapRank(
      {
        tokenx: dstToken.tokenName,
        tokeny: srcToken.tokenName,
        name: tmpName,
      },
      {
        successCb: () => {
          changeFieldValue('spinningRank', false)
          changeFieldValue('requestingRank', false)
        },
        failCb: () => {
          changeFieldValue('spinningRank', false)
          changeFieldValue('requestingRank', false)
        },
      },
    )
  }

  startPoll = () => {
    this.timeout = setTimeout(() => {
      const { srcToken, dstToken } = this.props

      this.getSwapRank(srcToken, dstToken)
    }, pollInterval)

    return true
  }

  reqLockReverse = (data, cb) => {
    const {
      ironmanData: {
        fibos,
        requiredFields,
        account: { name },
        authorization,
      },
      requestingContract,

      changeFieldValue,
    } = this.props

    if (requestingContract) message.warning(intl.get('WAITING_FOR_REQUEST'))

    if (!fibos) return message.error(intl.get('EXTENSION_MISSING'))

    if (fibos) {
      const { locked, x, xPre, y, yPre } = data

      const reqData = {
        owner: name,
        x: `${getStrWithPrecision(0, xPre)} ${x}`,
        y: `${getStrWithPrecision(0, yPre)} ${y}`,
      }

      changeFieldValue('requestingContract', true)
      fibos.contract('eosio.token', { requiredFields }).then(contract => {
        contract[locked ? 'unlckreserve' : 'lockreserve'](reqData, {
          authorization,
        })
          .then(trx => {
            const transactionId = trx.transaction_id

            if (transactionId) {
              message.success(intl.get('ACTION_SUCCESS'))
            } else {
              message.error(intl.get('ACTION_FAIL'))
            }

            changeFieldValue('requestingContract', false)

            if (cb) {
              cb()
            }
          })
          .catch(e => {
            contractErrorCollector(e)

            changeFieldValue('requestingContract', false)

            if (cb) {
              cb()
            }
          })
      })
    }

    return true
  }

  render() {
    const {
      dstToken,
      srcToken,
      needToReverse,

      rankData,
      spinningRank,
      transPairDetail,
      accountPairData,
    } = this.props

    let totalAmountOfDstLabel = null
    let totalAmountOfDstValue = null
    if (transPairDetail.tokenxSymbol) {
      totalAmountOfDstLabel = `${transPairDetail.tokenxSymbol} ${intl.get('TOTAL_AMOUNT')}`
      totalAmountOfDstValue = transPairDetail.tokenxQuantity
    }

    if (!transPairDetail.tokenxSymbol) {
      if (needToReverse) {
        totalAmountOfDstLabel = `${dstToken.symbol} ${intl.get('TOTAL_AMOUNT')}`
        totalAmountOfDstValue = getStrWithPrecision(0, dstToken.tokenPre)
      } else {
        totalAmountOfDstLabel = `${srcToken.symbol} ${intl.get('TOTAL_AMOUNT')}`
        totalAmountOfDstValue = getStrWithPrecision(0, srcToken.tokenPre)
      }
    }

    let totalAmountOfSrcLabel = null
    let totalAmountOfSrcValue = null
    if (transPairDetail.tokenySymbol) {
      totalAmountOfSrcLabel = `${transPairDetail.tokenySymbol} ${intl.get('TOTAL_AMOUNT')}`
      totalAmountOfSrcValue = transPairDetail.tokenyQuantity
    }

    if (!transPairDetail.tokenySymbol) {
      if (needToReverse) {
        totalAmountOfSrcLabel = `${srcToken.symbol} ${intl.get('TOTAL_AMOUNT')}`
        totalAmountOfSrcValue = getStrWithPrecision(0, srcToken.tokenPre)
      } else {
        totalAmountOfSrcLabel = `${dstToken.symbol} ${intl.get('TOTAL_AMOUNT')}`
        totalAmountOfSrcValue = getStrWithPrecision(0, dstToken.tokenPre)
      }
    }

    return (
      <SpinWrapper spinning={spinningRank}>
        <div className={styles.wrapper}>
          <div className={styles.contentWrapper}>
            <div className={styles.rowTitleWrapper}>{intl.get('LOWER_HOLD_INFO')}</div>
            <div className={styles.totalWrapper}>
              <div className={styles.labelValueRow}>
                <div className={styles.label}>{totalAmountOfDstLabel}</div>
                <div className={styles.value}>{totalAmountOfDstValue}</div>
              </div>
              <div className={styles.labelValueRow}>
                <div className={styles.label}>{totalAmountOfSrcLabel}</div>
                <div className={styles.value}>{totalAmountOfSrcValue}</div>
              </div>
            </div>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.rankWrapper}>
              <div className={styles.rowTitleWrapper}>{intl.get('LOWER_HOLD_RANK')}</div>
              {rankData && rankData.length > 0 && (
                <div className={styles.titleWrapper}>
                  <div className={styles.titleHead}>{intl.get('RANK')}</div>
                  <div className={styles.titleTail}>{intl.get('LOWER_HOLD_RATE')}</div>
                </div>
              )}
              {rankData.map(item => {
                const { no, account, rate, status } = item

                return (
                  <div className={styles.contentRow} key={no}>
                    <div className={styles.rowKey}>
                      <div className={styles.rowKeyNo}>{`${no}、`}</div>
                      <div className={styles.rowKeyName}>{account}</div>
                    </div>
                    <div className={styles.rowValueWrapper}>
                      <div className={styles.rowValue}>{`${rate}%`}</div>
                      <div className={styles.rowLock}>
                        <LockIcon status={status} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {Object.keys(accountPairData).length > 0 && (
            <div className={styles.contentWrapper}>
              <div className={styles.rowTitleWrapper}>{intl.get('LOWER_HOLD_MY')}</div>
              <div className={styles.detailWrapper}>
                <div className={styles.labelValueRow}>
                  <div className={styles.label}>
                    {transPairDetail.tokenxSymbol ? `${transPairDetail.tokenxSymbol}` : null}
                  </div>
                  <div className={styles.valueWithIcon}>
                    {accountPairData.tokenx_quantity && (
                      <div className={styles.value}>
                        {accountPairData.tokenx_quantity ||
                          getStrWithPrecision(0, 0 || transPairDetail.tokenxPre)}
                      </div>
                    )}
                    <div className={styles.rowLock}>
                      {accountPairData.status === 'locked' && (
                        <div className={styles.statusTip}>{intl.get('LOCK_HOLD')}</div>
                      )}
                      {accountPairData.status === 'unlocking' && (
                        <div className={styles.statusTip}>{intl.get('UNLOCKING')}</div>
                      )}
                      {accountPairData.status === 'unlocked' && (
                        <div className={styles.statusTip}>{intl.get('ALREADY_UNLOCKED')}</div>
                      )}
                      {accountPairData.status && <LockIcon status={accountPairData.status} />}
                    </div>
                  </div>
                </div>
                <div className={styles.labelValueRow}>
                  <div className={styles.label}>
                    {transPairDetail.tokenySymbol ? `${transPairDetail.tokenySymbol}` : null}
                  </div>
                  <div className={styles.valueWithIcon}>
                    {accountPairData.tokeny_quantity && (
                      <div className={styles.value}>
                        {accountPairData.tokeny_quantity ||
                          getStrWithPrecision(0, 0 || transPairDetail.tokenyPre)}
                      </div>
                    )}
                    <div className={styles.rowLock}>
                      {accountPairData.status === 'locked' && (
                        <div className={styles.statusTip}>{intl.get('LOCK_HOLD')}</div>
                      )}
                      {accountPairData.status === 'unlocking' && (
                        <div className={styles.statusTip}>{intl.get('UNLOCKING')}</div>
                      )}
                      {accountPairData.status === 'unlocked' && (
                        <div className={styles.statusTip}>{intl.get('ALREADY_UNLOCKED')}</div>
                      )}
                      {accountPairData.status && <LockIcon status={accountPairData.status} />}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.lockWrapper}>
                {accountPairData.tokenx_quantity && accountPairData.tokeny_quantity && (
                  <div className={styles.contentRow}>
                    <div className={styles.rowText}>{intl.get('LOCK_HOLD')}</div>
                    <div className={styles.rowLock}>
                      {accountPairData.status === 'locked' && (
                        <div className={styles.statusTip}>{intl.get('LOCK_HOLD')}</div>
                      )}
                      {accountPairData.status === 'unlocking' && (
                        <div className={styles.statusTip}>{intl.get('UNLOCKING')}</div>
                      )}
                      {accountPairData.status === 'unlocked' && (
                        <div className={styles.statusTip}>{intl.get('UNLOCKED')}</div>
                      )}
                      <Switch
                        className={styles.switch}
                        disabled={Object.keys(accountPairData).length === 0}
                        checked={accountPairData.status === 'locked'}
                        onClick={() => {
                          if (Object.keys(accountPairData).length === 0) {
                            return message.error(intl.get('MY_HOLD_EMPTY'))
                          }

                          const reqFuc = () => {
                            this.reqLockReverse({
                              locked: accountPairData.status === 'locked',
                              x: transPairDetail.tokenxName,
                              xPre: transPairDetail.tokenxPre,
                              y: transPairDetail.tokenyName,
                              yPre: transPairDetail.tokenyPre,
                            })
                          }

                          if (transPairDetail && Object.keys(transPairDetail).length > 0) {
                            if (accountPairData.status === 'unlocking') {
                              Modal.confirm({
                                title: intl.get('TIPS'),
                                content: intl.get('UNLOCKING_TIPS'),
                                okText: intl.get('YES'),
                                cancelText: intl.get('NO'),
                                onOk: reqFuc,
                              })

                              return true
                            }

                            return reqFuc()
                          }

                          return message.error(intl.get('NO_HOLD_INFO_GOT'))
                        }}
                      />
                    </div>
                  </div>
                )}
                {accountPairData.tokenx_quantity && accountPairData.tokeny_quantity && (
                  <div className={styles.myHoldExplanationWrapper}>
                    <div className={styles.myHoldExplanation}>{intl.get('EXPLANATION')}</div>
                    <div className={styles.myHoldExplanation}>
                      {intl.get('LOCK_HOLD_EXPLANATION_1')}
                    </div>
                    <div className={styles.myHoldExplanation}>
                      {intl.get('LOCK_HOLD_EXPLANATION_2')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SpinWrapper>
    )
  }
}

export default Rank
