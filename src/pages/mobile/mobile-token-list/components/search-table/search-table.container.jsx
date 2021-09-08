import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-token-list/mobile-token-list.action'
import TokenTable from './search-table.component'

const mapStateToProps = state => {
  const {
    searchTableSpinning,
    searchTableRequesting,

    isSearching,
    searchValue,

    searchData,
  } = state.mobileTokenList

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    searchTableSpinning,
    searchTableRequesting,

    isSearching,
    searchValue,

    searchData,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TokenTable)
