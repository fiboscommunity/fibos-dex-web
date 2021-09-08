import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import AddPairs from './add-pairs.component'

const mapStateToProps = state => {
  const {
    requestingAddPair,
    addPairModalShow,
    addPairType,
    addPairDstToken,
    addPairDstTokenName,
    addPairDstTokenInput,
    addPairSrcToken,
    addPairSrcTokenName,
    addPairSrcTokenInput,
    requestingTemporayAddPairAvailable,
    temporayAddPairAvailable,

    requestingTokensForSelect,
    tokensForSelect,
    tableRowOfAccounts,
  } = state.exchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    requestingAddPair,
    addPairModalShow,
    addPairType,
    addPairDstToken,
    addPairDstTokenName,
    addPairDstTokenInput,
    addPairSrcToken,
    addPairSrcTokenName,
    addPairSrcTokenInput,
    requestingTemporayAddPairAvailable,
    temporayAddPairAvailable,

    requestingTokensForSelect,
    tokensForSelect,
    tableRowOfAccounts,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddPairs)
