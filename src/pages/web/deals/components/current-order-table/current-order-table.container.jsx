import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/deals/deals.action'
import CurrentOrderTable from './current-order-table.component'

const mapStateToProps = state => {
  const {
    pairId,
    requestingContract,

    currentOrderTableSpinning,
    currentOrderTableRequesting,

    currentOrderTableData,

    currentOrderDataTotal,
    currentOrderDataPage,
    currentOrderDataPageSize,
  } = state.deals
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    pairId,
    requestingContract,

    currentOrderTableSpinning,
    currentOrderTableRequesting,

    currentOrderTableData,

    currentOrderDataTotal,
    currentOrderDataPage,
    currentOrderDataPageSize,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CurrentOrderTable)
