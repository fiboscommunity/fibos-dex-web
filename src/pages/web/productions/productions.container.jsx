import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import Productions from './productions.component'
import * as actions from './productions.action'

const mapStateToProps = state => ({ ...state.productions })

export default customizedConnect('productions', actions, withRouter(Productions), {
  mapStateToProps,
})
