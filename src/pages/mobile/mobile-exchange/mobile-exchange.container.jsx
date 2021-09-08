import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import MobileExchange from './mobile-exchange.component'
import * as actions from './mobile-exchange.action'

const mapStateToProps = state => {
  const { mobileNavHeight } = state.home

  return { mobileNavHeight, ...state.mobileExchange }
}

export default customizedConnect('mobileExchange', actions, withRouter(MobileExchange), {
  mapStateToProps,
})
