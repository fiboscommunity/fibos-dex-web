import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-exchange/mobile-exchange.action'
import Rank from './rank.component'

const mapStateToProps = state => {
  const {
    spinningRank,
    requestingRank,
    srcToken,
    dstToken,
    needToReverse,

    transPairDetail,
    accountPairData,
    rankData,
    rankTab,
  } = state.mobileExchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    spinningRank,
    requestingRank,
    srcToken,
    dstToken,
    needToReverse,

    transPairDetail,
    accountPairData,
    rankData,
    rankTab,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Rank)
