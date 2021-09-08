import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'

import MobileMarkets from './mobile-markets.component'
import * as actions from './mobile-markets.action'

const mapStateToProps = state => ({ ...state.mobileMarkets })

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(MobileMarkets))
