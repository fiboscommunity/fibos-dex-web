import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Mobile/mobile-markets/mobile-markets.action'
import ProductionGrid from './production-grid.component'

const mapStateToProps = state => {
  const {
    productionGridSpinning,
    productionGridRequesting,

    gridData,
    gridDataTotal,
  } = state.mobileMarkets

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    productionGridSpinning,
    productionGridRequesting,

    gridData,
    gridDataTotal,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProductionGrid)
