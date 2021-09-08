import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/deals/deals.action'
import PairsSearch from './pairs-search.component'

const mapStateToProps = state => {
  const { searchVal, pairsDropList } = state.deals

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
