import { getPrecision, commonErrorHandler, req, errorHandler } from 'Utils'

const prefix = 'MobileDeals_'

export const changeFieldValue = (field, value) => dispatch => {
  dispatch({
    type: `${prefix}changeFieldValue`,
    field,
    value,
  })
}

export const destroy = () => dispatch => {
  dispatch({
    type: `${prefix}destroy`,
  })
}

export const resetPairsDropList = () => dispatch => {
  dispatch({
    type: `${prefix}resetPairsDropList`,
  })
}

export const requestForSearchingPairs = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.search) {
    filterStr += `
        or: [{
          tokenx_id:{
            like: "%${filter.search || ''}%"
          },
          status: {
            eq: "online"
          }
        },{
          tokeny_id:{
            like: "%${filter.search || ''}%"
          },
          status: {
            eq: "online"
          }
        }]
        `
  } else {
    filterStr += `
        status: {
          eq: "online"
        }
        `
  }

  const reqMessage = `
  {
    find_tokenpair(
      where:{${filterStr}
      },
      order: "-created"
    ){
      id,
      tokenx {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
      },
      tokeny {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
      }
      type,
      created,
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_tokenpair) {
      const tmp = reponse.data.data.find_tokenpair || []

      const result = tmp.map(item => {
        const { id, type } = item
        const tmpTokenx = item.tokenx.id
        const tmpTokeny = item.tokeny.id
        const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
        const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

        let needToReverse = false

        if (
          (filter.search &&
            tmpTokeny.toLowerCase().indexOf(filter.search.toLowerCase()) >= 0 &&
            tmpTokenx.toLowerCase().indexOf(filter.search.toLowerCase()) < 0) ||
          tokenySymbol.toLowerCase() === filter.search.toLowerCase()
        ) {
          needToReverse = true
        }

        const tokenXObj = {
          tokenName: tmpTokenx,
          symbol: tokenxSymbol,
          contract: tokenxContract,
          pre: getPrecision(item.tokenx.precision),
        }

        const tokenYObj = {
          tokenName: tmpTokeny,
          symbol: tokenySymbol,
          contract: tokenyContract,
          pre: getPrecision(item.tokeny.precision),
        }

        return {
          id,
          type,
          srcToken: needToReverse ? tokenXObj : tokenYObj,
          dstToken: needToReverse ? tokenYObj : tokenXObj,
        }
      })

      dispatch({
        type: `${prefix}requestForSearchingPairs`,
        data: [...result],
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

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForTotalOfCurrentOrder = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
        account_id: {
            eq: "${filter.account || ''}"
          }
        `
  }

  const reqMessage = `
  {
    count_order(
      where:{${filterStr}
        status:{
          eq: "waiting"
        }
      },
      order: "-created"
    )
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      const tmp = reponse.data.data.count_order || 0

      dispatch({
        type: `${prefix}requestForTotalOfCurrentOrder`,
        data: tmp,
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForDataOfCurrentOrder = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
        account_id: {
            eq: "${filter.account || ''}"
          }
        `
  }

  const page =
    Object.prototype.toString.call(filter.page) === '[object Number]' ? filter.page || 1 : 1
  const pagesize =
    Object.prototype.toString.call(filter.pagesize) === '[object Number]'
      ? filter.pagesize || 10
      : 10

  const reqMessage = `
  {
    find_order(
      where:{${filterStr}
        status:{
          eq: "waiting"
        }
      },
      skip: ${(page - 1) * pagesize},
      limit: ${pagesize},
      order: "-created"
    ){
      id,
      direction,
      status,
      price,
      account {
        id
      },
      tokenpair {
        id,
        tokenx {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        },
        tokeny {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        }
        type,
        created,
      },
      tokenx_quantity,
      tokeny_quantity,
      dealled,
      created,
    }
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_order) {
      const tmp = reponse.data.data.find_order || []

      dispatch({
        type: `${prefix}requestForDataOfCurrentOrder`,
        data: [...tmp],
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForTotalOfHistoryOrder = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
        account_id: {
            eq: "${filter.account || ''}"
          }
        `
  }

  const reqMessage = `
  {
    count_order(
      where:{${filterStr}
        status:{
          in: ["complete", "cancel"]
        }
      },
      order: "-created"
    )
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      const tmp = reponse.data.data.count_order || 0

      dispatch({
        type: `${prefix}requestForTotalOfHistoryOrder`,
        data: tmp,
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForDataOfHistoryOrder = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
        account_id: {
            eq: "${filter.account || ''}"
          }
        `
  }

  const page =
    Object.prototype.toString.call(filter.page) === '[object Number]' ? filter.page || 1 : 1
  const pagesize =
    Object.prototype.toString.call(filter.pagesize) === '[object Number]'
      ? filter.pagesize || 10
      : 10

  const reqMessage = `
  {
    find_order(
      where:{${filterStr}
        status:{
          in: ["complete", "cancel"]
        }
      },
      skip: ${(page - 1) * pagesize},
      limit: ${pagesize},
      order: "-created"
    ){
      id,
      direction,
      status,
      price,
      deal{
        id,
        fromaccount {
          id,
        },
        tokenpair {
          id,
          tokenx {
            id,
            precision,
            cw_name,
            connector_weight,
            position,
            created,
          },
          tokeny {
            id,
            precision,
            cw_name,
            connector_weight,
            position,
            created,
          }
          type,
          created,
        },
        direction,
        type,
        tokenx_quantity,
        tokeny_quantity,
        fee,
        price,
        created,
      },
      account {
        id
      },
      tokenpair {
        id,
        tokenx {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        },
        tokeny {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        }
        type,
        created,
      },
      tokenx_quantity,
      tokeny_quantity,
      dealled,
      created,
    }
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_order) {
      const tmp = reponse.data.data.find_order || []

      dispatch({
        type: `${prefix}requestForDataOfHistoryOrder`,
        data: [...tmp],
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForTotalOfDeals = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
          or: [{
            fromaccount_id:{
              eq: "${filter.account || ''}"
            }
          },{
            toaccount_id:{
              eq: "${filter.account || ''}"
            }
          }]
        `
  }

  const reqMessage = `
  {
    count_deal(
      where:{${filterStr}
      },
      order: "-created"
    )
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      const tmp = reponse.data.data.count_deal || 0

      dispatch({
        type: `${prefix}requestForTotalOfDeals`,
        data: tmp,
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForDataOfDeals = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
        `
  }

  if (!!filter && !!filter.direction) {
    filterStr += `
        direction:{
          eq: "${filter.direction || ''}"
        }
        `
  }

  if (!!filter && !!filter.account) {
    filterStr += `
        or: [{
          fromaccount_id:{
            eq: "${filter.account || ''}"
          }
        },{
          toaccount_id:{
            eq: "${filter.account || ''}"
          }
        }]
        `
  }

  const page =
    Object.prototype.toString.call(filter.page) === '[object Number]' ? filter.page || 1 : 1
  const pagesize =
    Object.prototype.toString.call(filter.pagesize) === '[object Number]'
      ? filter.pagesize || 10
      : 10

  const reqMessage = `
  {
    find_deal(
      where:{${filterStr}
      },
      skip: ${(page - 1) * pagesize},
      limit: ${pagesize},
      order: "-created"
    ){
      id,
      fromaccount {
        id,
      },
      tokenpair {
        id,
        tokenx {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        },
        tokeny {
          id,
          precision,
          cw_name,
          connector_weight,
          position,
          created,
        }
        type,
        created,
      },
      direction,
      type,
      tokenx_quantity,
      tokeny_quantity,
      fee,
      price,
      created,
    }
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_deal) {
      const tmp = reponse.data.data.find_deal || []

      dispatch({
        type: `${prefix}requestForDataOfDeals`,
        data: [...tmp],
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

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app',
  //   headers: {
  //     'Content-Type': 'application/graphql',
  //   },
  //   data: reqMessage,
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}
