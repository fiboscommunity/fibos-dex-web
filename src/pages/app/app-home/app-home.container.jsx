import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import * as actions from 'Web/home/home.action'
import HomeAppCom from './app-home.component'

const mapStateToProps = state => ({ ...state.home })

export default customizedConnect('home', actions, withRouter(HomeAppCom), {
  mapStateToProps,
})
