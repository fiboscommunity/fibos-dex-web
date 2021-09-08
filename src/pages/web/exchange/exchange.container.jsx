import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import Exchange from './exchange.component'
import * as actions from './exchange.action'

const mapStateToProps = state => ({ ...state.exchange })

export default customizedConnect('exchange', actions, withRouter(Exchange), {
  mapStateToProps,
})
