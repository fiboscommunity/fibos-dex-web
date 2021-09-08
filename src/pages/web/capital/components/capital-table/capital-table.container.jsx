import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/capital/capital.action'
import CapitalTable from './capital-table.component'

const mapStateToProps = state => {
  const { ironmanData } = state.home
  const {
    capitalTableData,
    expandedRowKeys,
    tokenmap,
    chargeModalVisible,
    addressModalVisible,
    identifycode,
    formType,
    capitalSpinning,
    qrcodeType,
    chargeAmount,
    chargeAmountDec,
    ethAddress,
    ethAddressAccessible,
    selectToken,
    requestingAsset,
    expiredTime,
    requestingContract,
    latestVerifyCode,
    inputValue,
    overTimeNotificationVisible,
    tokenFilter,
  } = state.capital

  return {
    ironmanData,

    capitalTableData,
    expandedRowKeys,
    tokenmap,
    chargeModalVisible,
    addressModalVisible,
    identifycode,
    formType,
    capitalSpinning,
    qrcodeType,
    chargeAmount,
    chargeAmountDec,
    ethAddress,
    ethAddressAccessible,
    selectToken,
    requestingAsset,
    expiredTime,
    requestingContract,
    latestVerifyCode,
    inputValue,
    overTimeNotificationVisible,
    tokenFilter,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CapitalTable)
