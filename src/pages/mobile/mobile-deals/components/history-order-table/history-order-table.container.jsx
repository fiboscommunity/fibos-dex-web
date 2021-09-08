import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-deals/mobile-deals.action'
import HistoryOrderTable from './history-order-table.component'

const mapStateToProps = state => {
  const {
    pairId,

    historyOrderTableSpinning,
    historyOrderTableRequesting,

    historyOrderTableData,

    historyOrderDataTotal,
    historyOrderDataPage,
    historyOrderDataPageSize,
  } = state.mobileDeals
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    pairId,

    historyOrderTableSpinning,
    historyOrderTableRequesting,

    historyOrderTableData,

    historyOrderDataTotal,
    historyOrderDataPage,
    historyOrderDataPageSize,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HistoryOrderTable)
