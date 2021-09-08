import { combineReducers } from 'redux'

/* Web app */
import announcements from 'Web/announcements/announcements.reducer'
import deals from 'Web/deals/deals.reducer'
import capital from 'Web/capital/capital.reducer'
import exchange from 'Web/exchange/exchange.reducer'
import home from 'Web/home/home.reducer'
import markets from 'Web/markets/markets.reducer'
import productionDetail from 'Web/production-detail/production-detail.reducer'
import productions from 'Web/productions/productions.reducer'

/* Mobile web app */
import mobileCharge from 'Mobile/mobile-charge/mobile-charge.reducer'
import mobileDeals from 'Mobile/mobile-deals/mobile-deals.reducer'
import mobileExchange from 'Mobile/mobile-exchange/mobile-exchange.reducer'
import mobileProductionDetail from 'Mobile/mobile-exchange/components/production-detail/production-detail.reducer'
import mobileMarkets from 'Mobile/mobile-markets/mobile-markets.reducer'
import mobileTokenList from 'Mobile/mobile-token-list/mobile-token-list.reducer'

export default combineReducers({
  /* Web app */
  announcements,
  deals,
  capital,
  exchange,
  home,
  markets,
  productionDetail,
  productions,

  /* Mobile web app */
  mobileCharge,
  mobileDeals,
  mobileExchange,
  mobileProductionDetail,
  mobileMarkets,
  mobileTokenList,
})
