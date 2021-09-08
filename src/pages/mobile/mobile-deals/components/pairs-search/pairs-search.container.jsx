import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-deals/mobile-deals.action'
import PairsSearch from './pairs-search.component'

const mapStateToProps = state => {
  const { searchVal, pairsDropList } = state.mobileDeals

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return { searchVal, pairsDropList }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PairsSearch)
