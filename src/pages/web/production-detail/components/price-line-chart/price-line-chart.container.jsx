import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/production-detail/production-detail.action'
import PriceLineChart from './price-line-chart.component'

const mapStateToProps = state => {
  const { tokenTableSpinning } = state.productionDetail

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    tokenTableSpinning,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PriceLineChart)
