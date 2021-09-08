import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

export default (
  stateIndex,
  actions,
  component,
  {
    mapStateToProps = state => ({ ...state[stateIndex] }),
    mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch),
  },
) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(component)
