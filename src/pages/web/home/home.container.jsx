import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import HomeWebCom from './home.component'
import * as actions from './home.action'

const mapStateToProps = state => ({ ...state.home })

export default customizedConnect('home', actions, withRouter(HomeWebCom), {
  mapStateToProps,
})
