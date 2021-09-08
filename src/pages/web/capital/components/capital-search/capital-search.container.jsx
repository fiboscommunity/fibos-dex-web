import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/capital/capital.action'
import CapitalSearch from './capital-search.component'

const mapStateToProps = state => {
  const { ironmanData } = state.home
  const {
    capitalTableData,
  } = state.capital

  return {
    ironmanData,

    capitalTableData,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CapitalSearch)
