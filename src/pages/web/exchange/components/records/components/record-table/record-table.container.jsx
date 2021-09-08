import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import RecordTable from './record-table.component'

const mapStateToProps = state => {
  const {
    pairId,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,

    recordPanelTab,

    spinningRecord,
    requestingRecord,
    recordData,
    recordDataTotal,
    recordDataPage,
    recordDataPageSize,
  } = state.exchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    pairId,
    srcToken,
    dstToken,
    needToReverse,
    tradingType,

    recordPanelTab,

    spinningRecord,
    requestingRecord,
    recordData,
    recordDataTotal,
    recordDataPage,
    recordDataPageSize,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(RecordTable)
