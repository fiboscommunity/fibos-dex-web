import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import Loadable from 'react-loadable'

import HomeWeb from 'Web/home'
import HomeMobile from 'Mobile/mobile-home'
import HomeApp from 'App/app-home'

import store from './store'

import * as serviceWorker from './serviceWorker'

import './color.css'
import 'nprogress/nprogress.css'

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line no-console
  console.log = () => {}
}

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/mobile" component={HomeMobile} />
        <Route path="/app" component={HomeApp} />
        <Route path="/" component={HomeWeb} />
      </Switch>
    </BrowserRouter>
  </Provider>
)

Loadable.preloadReady().then(() => {
  ReactDOM.render(<App />, document.getElementById('app'))
})

serviceWorker.unregister()
