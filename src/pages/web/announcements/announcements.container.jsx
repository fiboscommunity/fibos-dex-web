import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import Announcements from './announcements.component'
import * as actions from './announcements.action'

const mapStateToProps = state => ({ ...state.announcements })

export default customizedConnect('announcements', actions, withRouter(Announcements), {
  mapStateToProps,
})
