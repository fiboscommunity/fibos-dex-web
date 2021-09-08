import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import { Switch, Route } from 'react-router-dom'

import { LoadableComponent } from 'Commons'

import Markets from 'Web/markets'

const Exchange = LoadableComponent({
  loader: () => import('Web/exchange'),
  opts: {},
  nextProps: {},
})

const Productions = LoadableComponent({
  loader: () => import('Web/productions'),
  opts: {},
  nextProps: {},
})

const ProductionDetail = LoadableComponent({
  loader: () => import('Web/production-detail'),
  opts: {},
  nextProps: {},
})

const Announcements = LoadableComponent({
  loader: () => import('Web/announcements'),
  opts: {},
  nextProps: {},
})

const Deals = LoadableComponent({
  loader: () => import('Web/deals'),
  opts: {},
  nextProps: {},
})

const Capital = LoadableComponent({
  loader: () => import('Web/capital'),
  opts: {},
  nextProps: {},
})

const NoMatch = LoadableComponent({
  loader: () => import('Web/no-match'),
  opts: {},
  nextProps: {},
})

class HomeRouter extends PureComponent {
  render() {
    return (
      <Switch>
        <Route path="/" exact component={Markets} />
        <Route path="/markets" exact component={Markets} />
        <Route path="/exchange" exact component={Exchange} />
        <Route path="/productions" exact component={Productions} />
        <Route path="/production/:id" component={ProductionDetail} />
        <Route path="/token/:id" component={ProductionDetail} />
        <Route path="/deals" exact component={Deals} />
        <Route path="/capital" exact component={Capital} />
        <Route path="/announcements" exact component={Announcements} />
        <Route path="/announcements/:id" exact component={Announcements} />
        <Route back component={NoMatch} />
      </Switch>
    )
  }
}

export default withRouter(HomeRouter)
