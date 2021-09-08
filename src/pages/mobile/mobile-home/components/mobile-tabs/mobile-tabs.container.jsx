import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/home/home.action'
import MobileTabs from './mobile-tabs.component'

const mapStateToProps = state => {
  const { ironmanData, mobileTabValue } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,
    mobileTabValue,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MobileTabs)
