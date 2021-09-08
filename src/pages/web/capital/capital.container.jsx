import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import Capital from './capital.component'
import * as actions from './capital.action'

const mapStateToProps = state => {
  const { ironmanData } = state.home

  return {
    ironmanData,

    ...state.capital,
  }
}

export default customizedConnect('capital', actions, withRouter(Capital), {
  mapStateToProps,
})
