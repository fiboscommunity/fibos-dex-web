import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import Handicap from './handicap.component'

const mapStateToProps = state => {
  const {
    srcToken,
    dstToken,
    spinningHandicap,
    requestingHandicap,
    handicapType,
    handicapData,
    handicapAmountMax,
  } = state.exchange

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    srcToken,
    dstToken,
    spinningHandicap,
    requestingHandicap,
    handicapType,
    handicapData,
    handicapAmountMax,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Handicap)
