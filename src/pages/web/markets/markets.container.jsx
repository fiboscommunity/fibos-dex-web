import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'

import Markets from './markets.component'
import * as actions from './markets.action'

const mapStateToProps = state => ({ ...state.markets })

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(Markets))
