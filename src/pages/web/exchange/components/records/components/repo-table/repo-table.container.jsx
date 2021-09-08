import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import RepoTable from './repo-table.component'

const mapStateToProps = state => {
  const {
    pairId,
    srcToken,
    dstToken,
    needToReverse,

    recordPanelTab,

    spinningRepo,
    requestingRepo,
    repoData,
    repoDataTotal,
    repoDataPage,
    repoDataPageSize,
  } = state.exchange
  const { ironmanData } = state.home

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    pairId,
    srcToken,
    dstToken,
    needToReverse,

    recordPanelTab,

    spinningRepo,
    requestingRepo,
    repoData,
    repoDataTotal,
    repoDataPage,
    repoDataPageSize,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RepoTable)
