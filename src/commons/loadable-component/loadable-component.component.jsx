import React from 'react'
import Loadable from 'react-loadable'
import NProgress from 'nprogress'

import { Loading } from 'Components'

function LoadableComponent({ loader, options = {}, nextProps = {} }) {
  return Loadable({
    loader: () => {
      NProgress.start()
      return loader()
        .then(component => {
          NProgress.done()

          return component
        })
        .catch(() => {
          NProgress.done()

          throw new Error('Component can not be found.')
        })
    },
    loading: Loading,
    timeout: 10000,
    render(loaded, props) {
      const Component = loaded.default

      return <Component {...props} {...nextProps} />
    },
    ...options,
  })
}

export default LoadableComponent
