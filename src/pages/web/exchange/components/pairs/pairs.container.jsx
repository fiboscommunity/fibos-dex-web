import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import Pairs from './pairs.component'

const mapStateToProps = state => {
  const {
    requestDataOfCurrentpair,
    spinningPairs,
    requestingPairs,
    selectedSrcToken,
    pairs,
    pairsDropList,
  } = state.exchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    requestDataOfCurrentpair,
    spinningPairs,
    requestingPairs,
    selectedSrcToken,
    pairs,
    pairsDropList,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Pairs)
