import moment from 'moment'
import BigNumber from 'bignumber.js'

import { repoAccount, queryList, queryStr, sortMap, pairMap } from 'Config'
import {
  getPrecision,
  getStrWithPrecision,
  commonErrorHandler,
  req,
  errorHandler,
  getMiddlehandicap,
} from 'Utils'

const prefix = 'Exchange_'

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

export const resetAvailable = () => dispatch => {
  dispatch({
    type: `${prefix}resetAvailable`,
  })
}

export const resetPair = () => dispatch => {
  dispatch({
    type: `${prefix}resetPair`,
  })
}

export const resetTokenPairDetail = () => dispatch => {
  dispatch({
    type: `${prefix}resetTokenPairDetail`,
  })
}

export const resetPairsDropList = () => dispatch => {
  dispatch({
    type: `${prefix}resetPairsDropList`,
  })
}

export const resetAddPairs = () => dispatch => {
  dispatch({
    type: `${prefix}resetAddPairs`,
  })
}

export const resetPanelFormData = () => dispatch => {
  dispatch({
    type: `${prefix}resetPanelFormData`,
  })
}

export const resetRecord = () => dispatch => {
  dispatch({
    type: `${prefix}resetRecord`,
  })
}

export const resetDelegate = () => dispatch => {
  dispatch({
    type: `${prefix}resetDelegate`,
  })
}

// request record total with pair data @dstToken/srcToken
export const requestForTableDataTotalOfRecord = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = `
        fromaccount_id:{
          ne: "${repoAccount || ''}"
        },
        toaccount_id:{
          ne: "${repoAccount || ''}"
        }
  `

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
        }
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
        type: `${prefix}requestForTableDataTotalOfRecord`,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request record data with pair data @dstToken/srcToken
export const requestForTableDataOfRecord = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = `
        fromaccount_id:{
          ne: "${repoAccount || ''}"
        },
        toaccount_id:{
          ne: "${repoAccount || ''}"
        }
  `

  if (!!filter && !!filter.pairId) {
    filterStr += `
        tokenpair_id:{
          eq: "${filter.pairId || ''}"
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
      toaccount {
        id,
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
        type: `${prefix}requestForTableDataOfRecord`,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request record total with pair data @dstToken/srcToken
export const requestForTableDataTotalOfRepo = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        or: [{
          fromaccount_id:{
            eq: "${repoAccount || ''}"
          },
          tokenpair_id:{
            eq: "${filter.pairId || ''}"
          }
        },{
          toaccount_id:{
            eq: "${repoAccount || ''}"
          },
          tokenpair_id:{
            eq: "${filter.pairId || ''}"
          }
        }]
        `
  } else {
    filterStr += `
        or: [{
          fromaccount_id:{
            eq: "${repoAccount || ''}"
          }
        },{
          toaccount_id:{
            eq: "${repoAccount || ''}"
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
        type: `${prefix}requestForTableDataTotalOfRepo`,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request record data with pair data @dstToken/srcToken
export const requestForTableDataOfRepo = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.pairId) {
    filterStr += `
        or: [{
          fromaccount_id:{
            eq: "${repoAccount || ''}"
          },
          tokenpair_id:{
            eq: "${filter.pairId || ''}"
          }
        },{
          toaccount_id:{
            eq: "${repoAccount || ''}"
          },
          tokenpair_id:{
            eq: "${filter.pairId || ''}"
          }
        }]
        `
  } else {
    filterStr += `
        or: [{
          fromaccount_id:{
            eq: "${repoAccount || ''}"
          }
        },{
          toaccount_id:{
            eq: "${repoAccount || ''}"
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
      tokenpair{
        id
      },
      fromaccount {
        id,
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
        type: `${prefix}requestForTableDataOfRepo`,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request delegate data with pair data @dstToken/srcToken
export const requestForTableDataOfDelegate = (filter, cbs) => dispatch => {
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

  if (!!filter && !!filter.account) {
    filterStr += `
        account_id: {
            eq: "${filter.account || ''}"
          }
        `
  }

  const reqMessage = `
  {
    find_order(
      where:{${filterStr}
        status:{
          eq: "waiting"
        }
      },
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
        type: `${prefix}requestForTableDataOfDelegate`,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request srcToken info data @srcToken
export const getTokenDetails = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.supply) {
      const tmp = reponse.data

      dispatch({
        type: `${prefix}getTokenDetails`,
        data: {
          ...tmp,
        },
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

  const { symbol, contract } = data

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app/tokenpair/getTokenDetail',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: {
  //     symbol,
  //     contract,
  //   },
  // })

  req
    .callApi('/1.0/app/tokenpair/getTokenDetail', 'post', {
      symbol,
      contract,
    })
    .then(successFuc)
    .catch(failFuc)
}

// request tokenpair data with search data @search
export const requestForSearchingPairs = (filter, cbs) => dispatch => {
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
        const { type } = item
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
          srcToken: needToReverse ? tokenXObj : tokenYObj,
          dstToken: needToReverse ? tokenYObj : tokenXObj,
          type,
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request tokenpairs table data with tab value @srcToken
export const requestForTableDataOfPairs = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  // let filterStr = ''

  // if (!!filter && !!filter.srcTokenName && !filter.dstTokenName) {
  //   filterStr += `
  //     or: [{
  //       tokenx_id:{
  //         eq: "${filter.srcTokenName || ''}"
  //       }
  //     },{
  //       tokeny_id:{
  //         eq: "${filter.srcTokenName || ''}"
  //       }
  //     }]
  //     `
  // }

  const filterStr = `
    or: [{
      tokenx_id:{
        in: ${queryStr || []}
      },
      status: {
        eq: "online"
      }
    },{
      tokeny_id:{
        in: ${queryStr || []}
      },
      status: {
        eq: "online"
      }
    }]
    `

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

      const kdataReqParamsArr = []
      const tokenArr = []

      tmp.forEach(item => {
        if (queryList.indexOf(item.tokenx.id) >= 0 && queryList.indexOf(item.tokeny.id) >= 0) {
          const { id, type } = item

          let tmpTokenx = ''
          let tmpTokenxPre = ''
          let tmpTokeny = ''
          let tmpTokenyPre = ''
          let tmpNeedToReverse = false

          if (pairMap[item.tokeny.id] && pairMap[item.tokeny.id].map.indexOf(item.tokenx.id) >= 0) {
            tmpNeedToReverse = true
          }

          if (tmpNeedToReverse) {
            tmpTokenx = item.tokeny.id
            tmpTokenxPre = item.tokeny.precision
            tmpTokeny = item.tokenx.id
            tmpTokenyPre = item.tokenx.precision
          } else {
            tmpTokenx = item.tokenx.id
            tmpTokenxPre = item.tokenx.precision
            tmpTokeny = item.tokeny.id
            tmpTokenyPre = item.tokeny.precision
          }

          // if (item.tokeny.id === filter.srcTokenName) {
          //   tmpTokenx = item.tokenx.id
          //   tmpTokenxPre = item.tokenx.precision
          //   tmpTokeny = item.tokeny.id
          //   tmpTokenyPre = item.tokeny.precision
          // } else {
          //   tmpTokenx = item.tokeny.id
          //   tmpTokenxPre = item.tokeny.precision
          //   tmpTokeny = item.tokenx.id
          //   tmpTokenyPre = item.tokenx.precision
          //   tmpNeedToReverse = true
          // }

          const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
          const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

          const tmpData = {
            id,

            tokenxName: tmpTokenx,
            tokenxSymbol,
            tokenxContract,
            tokenxPre: getPrecision(tmpTokenxPre),

            tokenyName: tmpTokeny,
            tokenySymbol,
            tokenyContract,
            tokenyPre: getPrecision(tmpTokenyPre),

            type,
            needToReverse: tmpNeedToReverse,
          }

          const tmpIndex = `${tmpTokenx}/${tmpTokeny}`

          if (tmpIndex in sortMap) {
            kdataReqParamsArr.push(tmpIndex)

            tokenArr.push(tmpData)
          }
        }
      })

      const now = moment(new Date())
      const nowVal = now.valueOf()

      const kdataReqParams = {
        duration: '24h',
        token_names: kdataReqParamsArr,
        stime: now.subtract(1, 'days').valueOf(),
        etime: nowVal,
      }

      // axios({
      //   method: 'POST',
      //   url: '/1.0/app/deal/kdata',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   data: kdataReqParams,
      // })

      req
        .callApi('/1.0/app/deal/kdata', 'post', kdataReqParams)
        .then(res => {
          const tmpResult = []

          res.data.forEach((item, index) => {
            const tmpDateLists = item.dateLists ? item.dateLists['24h'] || {} : {}

            tmpResult.push({
              ...tmpDateLists,
              ...tokenArr[index],
            })
          })

          req
            .callApi('/1.0/app/tokenpair/batchgetSwapRankOnChain', 'post', {
              tokenpairs: kdataReqParamsArr,
            })
            .then(onChainRes => {
              if (
                onChainRes.data &&
                Object.prototype.toString.call(onChainRes.data) === '[object Array]'
              ) {
                onChainRes.data.forEach((onChainResItem, onChainResIndex) => {
                  let tmpResultItem = tmpResult[onChainResIndex]

                  let uniswapPriceBN = new BigNumber(0)
                  let uniswapPricePre = 0
                  if (Object.prototype.toString.call(onChainResItem.data) === '[object Array]') {
                    const tmpTotal = onChainResItem.data.pop()

                    const currentIndex = `${tmpTotal.tokenx}/${tmpTotal.tokeny}`
                    const reverseCurrentIndex = `${tmpTotal.tokeny}/${tmpTotal.tokenx}`
                    if (kdataReqParamsArr.indexOf(currentIndex) >= 0) {
                      uniswapPriceBN = new BigNumber(tmpTotal.tokeny_quantity).div(
                        tmpTotal.tokenx_quantity,
                      )
                      uniswapPricePre = getPrecision(tmpTotal.tokeny_quantity)
                    } else if (kdataReqParamsArr.indexOf(reverseCurrentIndex) >= 0) {
                      uniswapPriceBN = new BigNumber(tmpTotal.tokenx_quantity).div(
                        tmpTotal.tokeny_quantity,
                      )
                      uniswapPricePre = getPrecision(tmpTotal.tokenx_quantity)
                    }

                    tmpResultItem = {
                      ...tmpResultItem,
                      uniswapPriceBN,
                      uniswapPrice: getStrWithPrecision(uniswapPriceBN, uniswapPricePre, true),
                    }
                  }

                  const { oprice, nprice } = tmpResultItem
                  let dayChangeNumber = new BigNumber(NaN)

                  if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
                    dayChangeNumber = new BigNumber(nprice).minus(oprice)
                  }

                  if (!dayChangeNumber.isNaN()) {
                    const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
                    const dayRateBN = dayChangeNumber.div(new BigNumber(oprice)).times(100)

                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN,
                      dayRate: dayRateBN.abs().toFixed(2, 1),
                      dayRateDrection,
                      dayChangeNumber,
                    }
                  } else {
                    tmpResult[onChainResIndex] = {
                      ...tmpResultItem,
                      dayRateBN: new BigNumber(0),
                      dayRate: '0.00',
                      dayRateDrection: 'up',
                      dayChangeNumber: '0',
                    }
                  }
                })

                const result = []

                tmpResult.forEach(item => {
                  const tmpIndex = `${item.tokenxName}/${item.tokenyName}`
                  if (tmpIndex in sortMap) {
                    result[sortMap[`${item.tokenxName}/${item.tokenyName}`]] = { ...item }
                  }
                })

                dispatch({
                  type: `${prefix}requestForTableDataOfPairs`,
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
            })
            .catch(failFuc)
        })
        .catch(failFuc)
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request tokenpair data with pair data @dstToken/srcToken
export const requestForDataOfPair = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.srcTokenName && !!filter.dstTokenName) {
    filterStr += `
      or: [{
        and:[
          {
            tokenx_id:{
              eq: "${filter.srcTokenName || ''}"
            }
          },
          {
            tokeny_id:{
              eq: "${filter.dstTokenName || ''}"
            }
          }
        ]
      },{
        and:[
          {
            tokenx_id:{
              eq: "${filter.dstTokenName || ''}"
            }
          },
          {
            tokeny_id:{
              eq: "${filter.srcTokenName || ''}"
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

      const tmpTokenObj = tmp[0]
      const { id, type } = tmpTokenObj

      let tmpTokenx = ''
      let tmpTokenxPre = ''
      let tmpTokeny = ''
      let tmpTokenyPre = ''
      let tmpNeedToReverse = false

      if (tmpTokenObj.tokeny.id === filter.srcTokenName) {
        tmpTokenx = tmpTokenObj.tokenx.id
        tmpTokenxPre = tmpTokenObj.tokenx.precision
        tmpTokeny = tmpTokenObj.tokeny.id
        tmpTokenyPre = tmpTokenObj.tokeny.precision
      } else {
        tmpTokenx = tmpTokenObj.tokeny.id
        tmpTokenxPre = tmpTokenObj.tokeny.precision
        tmpTokeny = tmpTokenObj.tokenx.id
        tmpTokenyPre = tmpTokenObj.tokenx.precision
        tmpNeedToReverse = true
      }

      const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
      const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

      const tokenObj = {
        id,

        tokenxName: tmpTokenx,
        tokenxSymbol,
        tokenxContract,
        tokenxPre: getPrecision(tmpTokenxPre),

        tokenyName: tmpTokeny,
        tokenySymbol,
        tokenyContract,
        tokenyPre: getPrecision(tmpTokenyPre),

        type,
        needToReverse: tmpNeedToReverse,
      }

      dispatch({
        type: `${prefix}requestForDataOfPair`,
      })

      if (successCallback) {
        try {
          successCallback(tokenObj)
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

export const requestForKDataOfPair = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = res => {
    if (!!res && !!res.data && !!res.data[0]) {
      const tmpDateLists = res.data[0].dateLists ? res.data[0].dateLists['24h'] || {} : {}

      let kdataReqResult = {}

      kdataReqResult = {
        ...tmpDateLists,
      }

      const { oprice, nprice } = kdataReqResult
      let dayChangeNumber = new BigNumber(NaN)

      if (oprice && oprice !== 'Infinity' && nprice && nprice !== 'Infinity') {
        dayChangeNumber = new BigNumber(nprice).minus(oprice)
      }

      if (!dayChangeNumber.isNaN()) {
        const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
        const dayRate = dayChangeNumber.div(new BigNumber(oprice)).times(100).abs().toFixed(2, 1)

        kdataReqResult = {
          ...kdataReqResult,
          dayRate,
          dayRateDrection,
          dayChangeNumber,
        }
      } else {
        kdataReqResult = {
          ...kdataReqResult,
          dayRate: '0.00',
          dayRateDrection: 'up',
          dayChangeNumber: '0',
        }
      }

      dispatch({
        type: `${prefix}requestForKDataOfPair`,
      })

      if (successCallback) {
        try {
          successCallback({ res: { ...kdataReqResult }, req: { ...data } })
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

  const { tokenx, tokeny } = data

  const now = moment(new Date())
  const nowVal = now.valueOf()

  const kdataReqParams = {
    duration: '24h',
    token_names: [`${tokenx}/${tokeny}`],
    stime: now.subtract(1, 'days').valueOf(),
    etime: nowVal,
  }

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app/deal/kdata',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: kdataReqParams,
  // })

  req.callApi('/1.0/app/deal/kdata', 'post', kdataReqParams).then(successFuc).catch(failFuc)
}

// request handicap data with pair data @dstToken/srcToken
export const getHandicapData = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data) {
      const { buy, sell, lastprice } = reponse.data
      const { limit } = data

      const tmpBuy = buy.map(item => ({
        ...item,
        type: 'buy',
      }))
      const tmpBuyMiddleAmount = getMiddlehandicap(tmpBuy, true)

      const emptyBuyRows = limit - tmpBuy.length > 0 ? limit - tmpBuy.length : 0
      const tmpEmptyBuyArray = Array(emptyBuyRows)
        .fill(undefined)
        .map(() => ({}))
      const emptyBuyArray = emptyBuyRows > 0 ? tmpEmptyBuyArray : []

      const tmpSell = sell.map(item => ({
        ...item,
        type: 'sell',
      }))
      const tmpSellMiddleAmount = getMiddlehandicap(tmpSell, true)

      const emptySellRows = limit - tmpSell.length > 0 ? limit - tmpSell.length : 0
      const tmpEmptySellRows = Array(emptySellRows)
        .fill(undefined)
        .map(() => ({}))
      const emptySellArray = emptySellRows > 0 ? tmpEmptySellRows : []

      const result = [...emptyBuyArray, ...tmpBuy, { lastprice }, ...tmpSell, ...emptySellArray]

      const reversedResult = result.reverse()

      dispatch({
        type: `${prefix}getHandicapData`,
        data: reversedResult,
        lastPrice: lastprice,
        handicapAmountMax: {
          sell: tmpSellMiddleAmount,
          buy: tmpBuyMiddleAmount,
        },
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

  const { tokenx, tokeny, limit } = data

  // axios({
  //   method: 'POST',
  //   url: '/1.0/app/order/getDepthmap',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: {
  //     tokenx,
  //     tokeny,
  //     limit,
  //   },
  // })

  req
    .callApi('/1.0/app/order/getDepthmap', 'post', {
      tokenx,
      tokeny,
      limit,
    })
    .then(successFuc)
    .catch(failFuc)
}

// request uniswap rank data with pair data @dstToken/srcToken
export const getSwapRank = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny, name } = data

  const successFuc = reponse => {
    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.data &&
      Object.prototype.toString.call(reponse.data.data) === '[object Array]'
    ) {
      const tmpData = [...reponse.data.data]

      const totalResData = tmpData.pop()
      const rankResData = tmpData

      let tmpPairDetail = {}
      let accountPairData = {}

      let totalWeights = 0
      let needToReverse = false
      if (Object.keys(totalResData).length > 0) {
        totalWeights = totalResData.total_weights

        if (totalResData.tokeny === tokenx) {
          needToReverse = true
        }

        const tmpTokenx = needToReverse ? totalResData.tokeny : totalResData.tokenx
        const tmpTokeny = needToReverse ? totalResData.tokenx : totalResData.tokeny

        const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
        const tokenxQuantity = needToReverse
          ? totalResData.tokeny_quantity
          : totalResData.tokenx_quantity

        const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')
        const tokenyQuantity = needToReverse
          ? totalResData.tokenx_quantity
          : totalResData.tokeny_quantity

        const uniswapPrice = new BigNumber(tokenyQuantity).div(tokenxQuantity)

        tmpPairDetail = {
          totalWeights,
          tokenxName: tmpTokenx,
          tokenxQuantity,
          tokenxPre: getPrecision(tokenxQuantity),
          tokenxSymbol,
          tokenxContract,
          tokenyName: tmpTokeny,
          tokenyQuantity,
          tokenyPre: getPrecision(tokenyQuantity),
          tokenySymbol,
          tokenyContract,
          uniswapPrice,
        }
      }

      const tmpRank = rankResData.map(item => {
        const { weight, account } = item

        if (account && name && name === account) {
          accountPairData = {
            account: item.account,
            status: item.status,
            tokenx: needToReverse ? item.tokeny : item.tokenx,
            tokenx_quantity: needToReverse ? item.tokeny_quantity : item.tokenx_quantity,
            tokeny: needToReverse ? item.tokenx : item.tokeny,
            tokeny_quantity: needToReverse ? item.tokenx_quantity : item.tokeny_quantity,
            weight: item.weight,
          }
        }

        return {
          ...item,
          rate: new BigNumber(weight).div(totalWeights).times(100).toFixed(4, 1),
        }
      })

      tmpRank.sort((a, b) => b.rate - a.rate)

      const result = tmpRank.map((item, index) => ({ ...item, no: index + 1 }))

      dispatch({
        type: `${prefix}getSwapRank`,
        pairDetail: { ...tmpPairDetail },
        rank: [...result],
        accountPairData,
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

    if (!!reponse && !!reponse.data && !!reponse.data.error) {
      dispatch({
        type: `${prefix}getSwapRank`,
        pairDetail: {
          uniswapPrice: new BigNumber(0),
        },
        rank: [],
      })

      if (failCallback) {
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
  //   url: '/1.0/app/tokenpair/getSwapRankOnChain',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: { tokenx, tokeny },
  // })

  req
    .callApi('/1.0/app/tokenpair/getSwapRankOnChain', 'post', { tokenx, tokeny })
    .then(successFuc)
    .catch(failFuc)
}

// request token data
export const requestForTokensForSelect = cbs => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const reqMessage = `
  {
    find_token(
      where: {
        status: {
          eq: "online"
        }
      }
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

      const result = tmp.map(item => {
        const { position } = item
        const tokenName = item.id
        const cwToken = item.cw_name

        const [symbol, contract] = tokenName.split('@')

        return {
          symbol,
          contract,
          tokenName,
          position,
          isSmart: parseFloat(item.connector_weight) > 0,
          cwToken,
          pre: getPrecision(item.precision),
        }
      })

      dispatch({
        type: `${prefix}requestForTokensForSelect`,
        data: [...result],
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}

// request uniswap rank data of current account with pair data @dstToken/srcToken
export const getUniswapAvailable = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny, account } = data

  const tokenxName = tokenx.tokenName
  const tokenxPre = tokenx.pre
  const tokenyName = tokeny.tokenName
  const tokenyPre = tokeny.pre

  const successFuc = reponse => {
    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.data &&
      Object.prototype.toString.call(reponse.data.data) === '[object Array]'
    ) {
      const tmpData = [...reponse.data.data]

      let uniswapAvailableSrcToken
      let uniswapAvailableDstToken

      tmpData.forEach(item => {
        if (item.account && item.account === account) {
          uniswapAvailableDstToken = getStrWithPrecision(
            tokenxName === item.tokenx ? item.tokenx_quantity : item.tokeny_quantity,
            tokenxPre,
          )

          uniswapAvailableSrcToken = getStrWithPrecision(
            tokenyName === item.tokeny ? item.tokeny_quantity : item.tokenx_quantity,
            tokenyPre,
          )
        }
      })

      dispatch({
        type: `${prefix}getUniswapAvailable`,
        data: {
          uniswapAvailableSrcToken: uniswapAvailableSrcToken || 0,
          uniswapAvailableDstToken: uniswapAvailableDstToken || 0,
        },
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

    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.error &&
      reponse.data.error.message === 'net catch'
    ) {
      dispatch({
        type: `${prefix}getUniswapAvailable`,
        data: {
          uniswapAvailableSrcToken: 0,
          uniswapAvailableDstToken: 0,
        },
      })

      if (failCallback) {
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
  //   url: '/1.0/app/tokenpair/getSwapRankOnChain',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: { tokenx: tokenxName, tokeny: tokenyName },
  // })

  req
    .callApi('/1.0/app/tokenpair/getSwapRankOnChain', 'post', {
      tokenx: tokenxName,
      tokeny: tokenyName,
    })
    .then(successFuc)
    .catch(failFuc)
}

export const requestForProductionData = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        token_id:{
          eq: "${filter.tokenName}"
        }`

  const reqMessage = `
  {
    find_product(
      where:{${filterStr}
      },
    ){
      id,
      name,
      token {
        id,
        precision,
        supply,
        maximum_supply,
        maximum_exchange,
        reserve_supply,
        reserve_connector_balance,
        connector_weight,
        buy_fee,
        sell_fee,
        cw_name,
        position,
        created,
      },
      imghash,
      status,
      description: descritption,
      amount,
      attributes,
      repoplan,
      company,
      hasrepoplan,
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const successFuc = reponse => {
    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.data &&
      !!reponse.data.data.find_product &&
      !!reponse.data.data.find_product[0]
    ) {
      const tmp = reponse.data.data.find_product[0] || []

      const {
        id,
        name,
        token,
        imghash,
        status,
        description,
        amount,
        company,
        attributes,
        repoplan,
        hasrepoplan,
      } = tmp

      const result = {
        id: id || undefined,
        name: name || undefined,
        token: token || {},
        imghash: imghash || undefined,
        status: status || undefined,
        description: description || undefined,
        amount: amount || undefined,
        company: company || undefined,
        attributes: attributes || {},
        repoplan: repoplan || {},
        hasrepoplan: hasrepoplan || 'no',
      }

      dispatch({
        type: `${prefix}requestForProductionData`,
        data: { ...result },
      })

      if (successCallback) {
        try {
          successCallback(tmp)
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

  req.callGraphql('/1.0/app', reqMessage).then(successFuc).catch(failFuc)
}
