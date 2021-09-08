import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import Deals from './deals.component'
import * as actions from './deals.action'

const mapStateToProps = state => {
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    ...state.deals,
  }
}

export default customizedConnect('deals', actions, withRouter(Deals), {
  mapStateToProps,
})
