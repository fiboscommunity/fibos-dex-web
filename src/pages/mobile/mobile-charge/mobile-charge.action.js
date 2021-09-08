import { Token } from 'Datasets'

import { commonErrorHandler, req, errorHandler } from 'Utils'

const prefix = 'MobileCharge_'

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

export const resetAddPairs = () => dispatch => {
  dispatch({
    type: `${prefix}resetAddPairs`,
  })
}

export const resetSelectToken = () => dispatch => {
  dispatch({
    type: `${prefix}resetSelectToken`,
  })
}

// request token data
export const requestForTokensForSelect = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = `
        {
          status: {
            eq: "online"
          }
        }
  `

  if (filter && filter.search) {
    filterStr = `
        {
          id: {
            like: "%${filter.search}%"
          }
          status: {
            eq: "online"
          }
        }
    `
  }

  const reqMessage = `
  {
    find_token(
      where: ${filterStr}
      order: "-created"
    ){
      id,
      precision,
      cw_name,
      connector_weight,
      position,
      created,
    }
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_token) {
      const tmp = reponse.data.data.find_token || []
      const tmpMap = {}

      const result = tmp.map(item => {
        const tmpTokenObj = new Token(item)
        const tmpItem = {
          tokenObj: tmpTokenObj,
        }

        tmpMap[tmpTokenObj.id] = tmpTokenObj

        return tmpItem
      })

      dispatch({
        type: `${prefix}requestForTokensForSelect`,
        data: [...result],
        map: { ...tmpMap },
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

// request pair data @dstToken/srcToken
export const checkTemporayPairAvailable = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.tokenx && !!filter.tokeny) {
    filterStr += `
        or: [{
          and:[
            {
              tokenx_id:{
                eq: "${filter.tokenx || ''}"
              }
            },
            {
              tokeny_id:{
                eq: "${filter.tokeny || ''}"
              }
            },
            {
              status:{
                eq: "online"
              }
            }
          ]
        },{
          and:[
            {
              tokenx_id:{
                eq: "${filter.tokeny || ''}"
              }
            },
            {
              tokeny_id:{
                eq: "${filter.tokenx || ''}"
              }
            },
            {
              status:{
                eq: "online"
              }
            }
          ]
        }]
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
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_tokenpair) {
      let temporayPairAvailable = false
      const tmp = reponse.data.data.find_tokenpair || []

      if (tmp.length <= 0) {
        temporayPairAvailable = true
      }

      dispatch({
        type: `${prefix}checkTemporayPairAvailable`,
        data: temporayPairAvailable,
      })

      if (successCallback) {
        try {
          successCallback(temporayPairAvailable)
        } catch (err) {
          errorHandler(err)
        }
      } else if (failCallback) {
        try {
          failCallback(temporayPairAvailable)
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}
