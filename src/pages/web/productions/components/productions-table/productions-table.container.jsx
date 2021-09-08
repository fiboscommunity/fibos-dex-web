import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/productions/productions.action'
import ProductionTable from './productions-table.component'

const mapStateToProps = state => ({ ...state.productions })

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProductionTable)
