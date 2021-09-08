import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import MobileDeals from './mobile-deals.component'
import * as actions from './mobile-deals.action'

const mapStateToProps = state => {
  const { ironmanData, mobileNavHeight } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,
    mobileNavHeight,

    ...state.mobileDeals,
  }
}

export default customizedConnect('mobileDeals', actions, withRouter(MobileDeals), {
  mapStateToProps,
})
