import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-exchange/mobile-exchange.action'
import DelegateTable from './delegate-table.component'

const mapStateToProps = state => {
  const {
    spinningDelegate,
    requestingDelegate,
    requestingContract,

    pairId,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,
    tradingPanelTab,

    onlyCurrent,
    delegateData,
    delegateDataTotal,
    delegateDataPage,
    delegateDataPageSize,
  } = state.mobileExchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    spinningDelegate,
    requestingDelegate,
    requestingContract,

    pairId,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,
    tradingPanelTab,

    onlyCurrent,
    delegateData,
    delegateDataTotal,
    delegateDataPage,
    delegateDataPageSize,
    ironmanData,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DelegateTable)
