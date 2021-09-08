import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import logger from 'redux-logger'
import reducer from '../reducer'

let tmp = null
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'testnet') {
  tmp = createStore(reducer, applyMiddleware(thunkMiddleware))
} else {
  tmp = createStore(reducer, applyMiddleware(thunkMiddleware, logger))
}

const store = { ...tmp }
export default store
