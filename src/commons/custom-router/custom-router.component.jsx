import React, { PureComponent } from 'react'
import { Route, Redirect } from 'react-router-dom'

class MyLoginRoute extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.state = {}

    this.adminAuthOnly = ['/childAccount', '/poundage', '/poundageFlow']
  }

  hasAdminAuth() {
    const { logInfo } = this.props

    return !!logInfo && !!logInfo.role && logInfo.role === 'admin'
  }

  render() {
    const { path } = this.props
    if (!this.hasAdminAuth() && this.adminAuthOnly.indexOf(path) >= 0) {
      return (
        <Redirect
          to={{
            pathname: '/',
          }}
        />
      )
    }

    return <Route {...this.props} />
  }
}

export default MyLoginRoute
