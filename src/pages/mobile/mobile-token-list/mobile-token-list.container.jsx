import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'

import TokenList from './mobile-token-list.component'
import * as actions from './mobile-token-list.action'

const mapStateToProps = state => ({ ...state.mobileTokenList })

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(TokenList))
