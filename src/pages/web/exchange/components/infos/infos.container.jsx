import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from 'Web/exchange/exchange.action'
import Infos from './infos.component'

const mapStateToProps = state => {
  const { spinningInfoData, requestingInfoData, dstToken, tradingType, infoData } = state.exchange
  const { ironmanData } = state.home
  const { issuer, symbol, contract, created, supply, price } = infoData

  /* *
    Reminder:
      Be Careful with every props you mapped to comp
  * */

  return {
    ironmanData,

    spinningInfoData,
    requestingInfoData,
    dstToken,
    tradingType,

    issuer,
    symbol,
    contract,
    created,
    supply,
    price,
    maxSupply: infoData.max_supply,
    maxExchange: infoData.max_exchange,
    connectorBalance: infoData.connector_balance,
    connectorBalanceIssuer: infoData.connector_balance_issuer,
    connectorWeight: infoData.connector_weight,
    reserveConnectorBalance: infoData.reserve_connector_balance,
    reserveSupply: infoData.reserve_supply,
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Infos)
