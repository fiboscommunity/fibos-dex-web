import { commonErrorHandler, req, errorHandler, getPrecision } from 'Utils'
import BigNumber from 'bignumber.js'

const prefix = 'Capital_'

const crossibleTokens = [
  {
    token: 'FOUSDT',
    contract: 'eosio',
    pre: 6,
  },
  {
    token: 'FODAI',
    contract: 'eosio',
    pre: 6,
  },
  {
    token: 'FOETH',
    contract: 'eosio',
    pre: 8,
  },
  {
    token: 'FOUSDK',
    contract: 'eosio',
    pre: 6,
  },
]
const ETHAddressLength = 40

export const changeFieldValue = (field, value) => dispatch => {
  dispatch({
    type: `${prefix}changeFieldValue`,
    field,
    value,
  })
}

export const destory = () => dispatch => {
  dispatch({
    type: `${prefix}destory`,
  })
}

export const getAsset = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const { account } = filter

  const reqParam = {
    account,
  }

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = response => {
    if (!!response && !!response.data && !!response.data.rows) {
      const tmp = response.data.rows
      const ethAddress = response.data.ethaddress.map(
        item => `0x${(Array(ETHAddressLength).join(0) + item).slice(-ETHAddressLength)}`,
      )
      const tmpResult = tmp.map(item => {
        const { balance } = item
        const prev = balance.quantity.split(' ')[0]
        const tokenInfo = {
          available: prev,
          token: balance.quantity.split(' ')[1],
          contract: balance.contract,
          pre: getPrecision(prev),
        }
        return tokenInfo
      })
      const crossibleTokensName = crossibleTokens.map(item => item.token)
      const tmpResultTokensName = tmpResult.map(item => item.token)
      const tops = crossibleTokens.map(item => {
        if (tmpResultTokensName.indexOf(item.token) > -1) {
          return tmpResult.filter(result => item.token === result.token)[0]
        }
        return {
          available: new BigNumber(0).toFixed(item.pre, 1),
          token: item.token,
          contract: item.contract,
          pre: item.pre,
        }
      })
      const others = tmpResult.filter(item => crossibleTokensName.indexOf(item.token) < 0)

      let result = [...tops, ...others]

      result = result.map((item, index) => ({
        ...item,
        id: index.toString(),
      }))

      dispatch({
        type: `${prefix}getAsset`,
        data: [...result],
        ethAddress,
        ethAddressAccessible: ethAddress.length > 0,
      })
      if (successCallback) {
        try {
          successCallback(result)
        } catch (err) {
          errorHandler(err)
        }
      } else if (failCallback) {
        try {
          failCallback()
        } catch (err) {
          errorHandler(err)
        }
      }
    }
  }

  req.callApi('1.0/app/user/getAsset', 'post', reqParam).then(successFuc).catch(failFuc)
}

export const changeAddress = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const { account, defaultethaddress } = filter

  const reqParam = {
    account,
    defaultethaddress,
  }

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = response => {
    if (!!response && !!response.data && response.data.message === 'set success') {
      dispatch({
        type: `${prefix}changeAddress`,
      })
      if (successCallback) {
        try {
          successCallback()
        } catch (err) {
          errorHandler(err)
        }
      } else if (failCallback) {
        try {
          failCallback()
        } catch (err) {
          errorHandler(err)
        }
      }
    }
  }

  req.callApi('1.0/app/user/setdefaultethaddress', 'post', reqParam).then(successFuc).catch(failFuc)
}

export const getVerifyCode = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const { account } = filter

  const reqParam = {
    account,
  }

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = response => {
    if (!!response && !!response.data) {
      const result = response.data.data
      dispatch({
        type: `${prefix}getVerifyCode`,
        data: result,
      })
      if (successCallback) {
        try {
          successCallback(result)
        } catch (err) {
          errorHandler(err)
        }
      } else if (failCallback) {
        try {
          failCallback()
        } catch (err) {
          errorHandler(err)
        }
      }
    }
  }

  req
    .callApi('1.0/app/receiptcode/getlastreceiptcode', 'post', reqParam)
    .then(successFuc)
    .catch(failFuc)
}
