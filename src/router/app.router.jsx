import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import { Switch, Route } from 'react-router-dom'

import { LoadableComponent } from 'Commons'

const MobileMarkets = LoadableComponent({
  loader: () => import('Mobile/mobile-markets'),
  opts: {},
  nextProps: {},
})

const MobileTokenList = LoadableComponent({
  loader: () => import('Mobile/mobile-token-list'),
  opts: {},
  nextProps: {},
})

const MobileCharge = LoadableComponent({
  loader: () => import('Mobile/mobile-charge'),
  opts: {},
  nextProps: {},
})

const MobileDeals = LoadableComponent({
  loader: () => import('Mobile/mobile-deals'),
  opts: {},
  nextProps: {},
})

const MobileExchange = LoadableComponent({
  loader: () => import('Mobile/mobile-exchange'),
  opts: {},
  nextProps: {},
})

const NoMatch = LoadableComponent({
  loader: () => import('Mobile/no-match'),
  opts: {},
  nextProps: {},
})

class MobileRouter extends PureComponent {
  render() {
    // const { match } = this.props
    const tmpMatch = '/app'

    return (
      <Switch>
        <Route path={`${tmpMatch}`} exact component={MobileMarkets} />
        <Route path={`${tmpMatch}/markets`} exact component={MobileMarkets} />
        <Route path={`${tmpMatch}/tokenlist`} exact component={MobileTokenList} />
        <Route path={`${tmpMatch}/createpair`} exact component={MobileCharge} />
        <Route path={`${tmpMatch}/reactivationpair`} exact component={MobileCharge} />
        <Route path={`${tmpMatch}/exchange`} exact component={MobileExchange} />
        {/* <Route path={`${match.path}/productions`} exact component={Productions} /> */}
        {/* <Route path={`${match.path}/production/:id`} component={ProductionDetail} /> */}
        {/* <Route path={`${match.path}/token/:id`} component={ProductionDetail} /> */}
        <Route path={`${tmpMatch}/deals`} exact component={MobileDeals} />
        {/* <Route path={`${match.path}/announcements`} exact component={Announcements} /> */}
        {/* <Route path={`${match.path}/announcements/:id`} exact component={Announcements} /> */}
        <Route back component={NoMatch} />
      </Switch>
    )
  }
}

export default withRouter(MobileRouter)
