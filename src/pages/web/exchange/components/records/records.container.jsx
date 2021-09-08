import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import Records from './records.component'

const mapStateToProps = state => {
  const {
    pairId,
    onlyCurrent,

    tradingType,
    recordPanelTab,

    repoDataTotal,
  } = state.exchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    pairId,
    onlyCurrent,

    tradingType,
    recordPanelTab,

    repoDataTotal,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Records)
