import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-token-list/mobile-token-list.action'
import TokenTable from './tokenpairs-table.component'

const mapStateToProps = state => {
  const {
    tokenTableSpinning,
    tokenTableRequesting,

    srcToken,
    search,

    tableData,

    npriceSort,
    dayRateSort,
    quantitysSort,
  } = state.mobileTokenList

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    tokenTableSpinning,
    tokenTableRequesting,

    srcToken,
    search,

    tableData,

    npriceSort,
    dayRateSort,
    quantitysSort,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TokenTable)
