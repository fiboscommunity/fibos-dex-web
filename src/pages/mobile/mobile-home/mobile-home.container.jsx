import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import * as actions from 'Web/home/home.action'
import HomeMobileCom from './mobile-home.component'

const mapStateToProps = state => ({ ...state.home })

export default customizedConnect('home', actions, withRouter(HomeMobileCom), {
  mapStateToProps,
})
