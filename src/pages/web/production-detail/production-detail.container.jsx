import { withRouter } from 'react-router'

import { customizedConnect } from 'Utils'

import ProductionDetail from './production-detail.component'
import * as actions from './production-detail.action'

const mapStateToProps = state => ({ ...state.productionDetail })

export default customizedConnect('productionDetail', actions, withRouter(ProductionDetail), {
  mapStateToProps,
})
