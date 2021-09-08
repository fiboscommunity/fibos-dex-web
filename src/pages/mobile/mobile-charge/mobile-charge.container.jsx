import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'

import MobileCharge from './mobile-charge.component'
import * as actions from './mobile-charge.action'

const mapStateToProps = state => {
  const { ironman, ironmanData, ironmanError, ironmanMissing, toLogin } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ...state.mobileCharge,

    ironman,
    ironmanData,
    ironmanError,
    ironmanMissing,
    toLogin,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(MobileCharge))
