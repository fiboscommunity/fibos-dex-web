import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-charge/mobile-charge.action'
import TokenTable from './token-table.component'

const mapStateToProps = state => {
  const {
    requestingTokensForSelect,

    searchValue,
    tokensForSelect,

    selectingToken,
    addPairDstToken,
    addPairSrcToken,
  } = state.mobileCharge

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    requestingTokensForSelect,

    searchValue,
    tokensForSelect,

    selectingToken,
    addPairDstToken,
    addPairSrcToken,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TokenTable)
