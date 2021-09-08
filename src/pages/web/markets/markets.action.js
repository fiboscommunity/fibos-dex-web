import moment from 'moment'
import BigNumber from 'bignumber.js'

import { Token } from 'Datasets'
import { repoAccount, queryList, queryStr, sortMap, pairMap } from 'Config'
import {
  getPrecision,
  getStrWithPrecision,
  commonErrorHandler,
  req,
  getDataListFromDataForCal,
  errorHandler,
} from 'Utils'

const prefix = 'Markets_'

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

export const changeSorters = (key, data) => dispatch => {
  dispatch({
    type: `${prefix}changeSorters`,
    key,
    data,
  })
}

export const requestForTableData = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
      or: [{
        tokenx_id:{
          in: ${queryStr || []}
      }
      },{
        tokeny_id:{
          in: ${queryStr || []}
        }
      }]
  `

  // let filterStr = ''

  // let queryToken = ''
  // if (!!filter && !!filter.srcTokenName) {
  //   switch (filter.srcTokenName) {
  //     case 'FO':
  //       queryToken = 'FO@eosio'
  //       break

  //     case 'FOUSDT':
  //       queryToken = 'FOUSDT@eosio'
  //       break

  //     case 'FOETH':
  //       queryToken = 'FOETH@eosio'
  //       break

  //     default:
  //       break
  //   }

  //   filterStr += `
  //       or: [{
  //         tokenx_id:{
  //           eq: "${queryToken || ''}"
  //         }
  //       },{
  //         tokeny_id:{
  //           eq: "${queryToken || ''}"
  //         }
  //       }]
  //       `
  // }

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
        createdAt,
        updatedAt,
      },
      tokeny {
        id,
        precision,
        cw_name,
        connector_weight,
        position,
        created,
        createdAt,
        updatedAt,
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

          // tmpTokenx = item.tokenx.id
          // tmpTokenxPre = item.tokenx.precision
          // tmpTokeny = item.tokeny.id
          // tmpTokenyPre = item.tokeny.precision

          const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
          const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

          const tmpData = {
            tokenxName: tmpTokenx,
            tokenxSymbol,
            tokenxContract,
            tokenxPre: getPrecision(tmpTokenxPre),

            tokenyName: tmpTokeny,
            tokenySymbol,
            tokenyContract,
            tokenyPre: getPrecision(tmpTokenyPre),

            needToReverse: tmpNeedToReverse,
          }

          const tmpIndex = `${tmpTokenx}/${tmpTokeny}`

          if (tmpIndex in sortMap) {
            kdataReqParamsArr.push(tmpIndex)

            tokenArr.push(tmpData)
          }
        }
      })

      // tmp.forEach(item => {
      //   if (
      //     pairsDsl[queryToken].indexOf(item.tokenx.id) >= 0 ||
      //     pairsDsl[queryToken].indexOf(item.tokeny.id) >= 0
      //   ) {
      //     let tmpTokenx = ''
      //     let tmpTokenxPre = ''
      //     let tmpTokeny = ''
      //     let tmpTokenyPre = ''
      //     let tmpNeedToReverse = false

      //     if (item.tokeny.id === queryToken) {
      //       tmpTokenx = item.tokenx.id
      //       tmpTokenxPre = item.tokenx.precision
      //       tmpTokeny = item.tokeny.id
      //       tmpTokenyPre = item.tokeny.precision
      //     } else {
      //       tmpTokenx = item.tokeny.id
      //       tmpTokenxPre = item.tokeny.precision
      //       tmpTokeny = item.tokenx.id
      //       tmpTokenyPre = item.tokenx.precision
      //       tmpNeedToReverse = true
      //     }

      //     const [tokenxSymbol, tokenxContract] = tmpTokenx.split('@')
      //     const [tokenySymbol, tokenyContract] = tmpTokeny.split('@')

      //     const tmpData = {
      //       tokenxName: tmpTokenx,
      //       tokenxSymbol,
      //       tokenxContract,
      //       tokenxPre: getPrecision(tmpTokenxPre),

      //       tokenyName: tmpTokeny,
      //       tokenySymbol,
      //       tokenyContract,
      //       tokenyPre: getPrecision(tmpTokenyPre),

      //       needToReverse: tmpNeedToReverse,
      //     }

      //     kdataReqParamsArr.push(`${tmpTokenx}/${tmpTokeny}`)

      //     tokenArr.push(tmpData)
      //   }
      // })

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
          const tmpResult = res.data.map((item, index) => {
            const tmpDateLists = item.dateLists ? item.dateLists['24h'] || {} : {}

            return {
              ...tmpDateLists,
              ...tokenArr[index],
            }
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

                  // if (oprice && uniswapPriceBN.gt(0)) {
                  //   const dayChangeNumber = new BigNumber(uniswapPriceBN).minus(
                  //     new BigNumber(oprice),
                  //   )
                  //   const dayRateDrection = dayChangeNumber.isNegative() ? 'down' : 'up'
                  //   const dayRateBN = dayChangeNumber.div(new BigNumber(oprice)).times(100)

                  //   tmpResult[onChainResIndex] = {
                  //     ...tmpResultItem,
                  //     dayRateBN,
                  //     dayRate: dayRateBN.abs().toFixed(2, 1),
                  //     dayRateDrection,
                  //     dayChangeNumber,
                  //   }
                  // }

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
                  type: `${prefix}requestForTableData`,
                  srcTokenName: filter.srcTokenName,
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
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForProductionData = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        status:{
          eq: "up"
        },
        hasrepoplan:{
          eq: "yes"
        }`

  const page =
    Object.prototype.toString.call(filter.page) === '[object Number]' ? filter.page || 1 : 1
  const pagesize =
    Object.prototype.toString.call(filter.pagesize) === '[object Number]'
      ? filter.pagesize || 10
      : 10

  const reqMessage = `
  {
    find_product(
      where:{${filterStr}
      },
      skip: ${(page - 1) * pagesize},
      limit: ${pagesize},
      order: "-createdAt"
    ){
      id,
      name,
      token {
        id,
        precision,
        supply,
        maximum_supply,
        reserve_supply,
      },
      imghash,
      status,
      description: descritption,
      amount,
      attributes,
      repoplan,
      company,
    }
  }`

  const failFuc = error => {
    commonErrorHandler(error, successCallback, failCallback)

    return true
  }

  const requestForAverageReo = (pairData, toHandleData) => {
    const stime = moment(new Date())
      .subtract(7, 'days')
      .startOf('day')
      .valueOf()
    const etime = moment(new Date())
      .startOf('day')
      .valueOf()

    // axios({
    //   method: 'POST',
    //   url: '/1.0/app/deal/kdata',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   data: {
    //     duration: '1d',
    //     account: repoAccount,
    //     token_names: pairData.map(item => item.pair),
    //     stime,
    //     etime,
    //   },
    // })

    req
      .callApi('/1.0/app/deal/kdata', 'post', {
        duration: '1d',
        account: repoAccount,
        token_names: pairData.map(({ tokenx, tokeny }) => `${tokeny}/${tokenx}`),
        stime,
        etime,
      })
      .then(reponse => {
        if (reponse.data) {
          const withRepoData = toHandleData.map((item, index) => {
            if (Object.keys(item).length <= 0) return item

            const tmpDateLists = reponse.data[index].dateLists || []

            let tmpAverage = null

            if (tmpDateLists.length > 0) {
              const filteredDateLists = getDataListFromDataForCal(tmpDateLists)

              tmpAverage = filteredDateLists
                .reduce(
                  (accumulator, currentValue) => accumulator.plus(currentValue.quantitys || 0),
                  new BigNumber(0),
                )
                // .div(filteredDateLists.length)
                .div(filteredDateLists.length > 7 ? 7 : filteredDateLists.length)
            }

            const {
              token: { precision },
            } = item
            const average = getStrWithPrecision(tmpAverage || 0, getPrecision(precision))

            return {
              ...item,
              sevenDaysAverage: average,
            }
          })

          let emptyProductionArray = []
          if (withRepoData.length < pagesize) {
            const toAdd = pagesize - withRepoData.length

            emptyProductionArray = Array(toAdd)
              .fill(undefined)
              .map(() => ({}))
          }

          dispatch({
            type: `${prefix}requestForProductionData`,
            data: [...withRepoData, ...emptyProductionArray],
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
      })
      .catch(failFuc)
  }

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data && !!reponse.data.data.find_product) {
      const tmpReponse = reponse.data.data.find_product || []

      const pairQueue = []

      tmpReponse.forEach((item, index) => {
        const { token, attributes } = item

        if (token.id && attributes.market) {
          pairQueue.push({
            pair: `${token.id}/${attributes.market}`,
            tokenx: token.id,
            tokenxPre: getPrecision(token.precision),
            tokeny: attributes.market,
            index,
          })
        }
      })

      // axios({
      //   method: 'POST',
      //   url: '/1.0/app/tokenpair/batchgetSwapRankOnChain',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   data: { tokenpairs: pairQueue.map(item => item.pair) },
      // })

      req
        .callApi('/1.0/app/tokenpair/batchgetSwapRankOnChain', 'post', {
          tokenpairs: pairQueue.map(item => item.pair),
        })
        .then(res => {
          if (res && res.data) {
            const tmpRes = {}

            res.data.forEach((item, resIndex) => {
              if (item.data && item.data.length > 0) {
                const tmp = [...item.data]

                tmpRes[resIndex] = {
                  ...tmp.pop(),
                }
              }
            })

            const result = tmpReponse.map((item, index) => {
              let totalResData = {}
              if (tmpRes[index]) {
                totalResData = { ...tmpRes[index] }
              }

              let tmpPairDetail = {}

              let totalWeights = 0
              if (Object.keys(totalResData).length > 0) {
                totalWeights = totalResData.total_weights

                let needToReverse = false
                if (totalResData.tokeny === pairQueue[index].tokenx) {
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

                const tokenxObj = new Token({
                  id: tmpTokenx,
                  precision: tokenxQuantity,
                })
                const tokenyObj = new Token({
                  id: tmpTokeny,
                  precision: tokenyQuantity,
                })

                const uniswapPrice = new BigNumber(tokenyQuantity).div(tokenxQuantity)

                tmpPairDetail = {
                  tokenx: tokenxObj,
                  tokeny: tokenyObj,
                  totalWeights,
                  tokenxQuantity,
                  tokenxSymbol,
                  tokenxContract,
                  tokenyQuantity,
                  tokenySymbol,
                  tokenyContract,
                  uniswapPrice,
                }
              }

              return {
                ...item,
                ...tmpPairDetail,
              }
            })

            requestForAverageReo(pairQueue, [...result])
          }
        })
        .catch(failFuc)

      if (pairQueue.length === 0) {
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

export const requestForTotalOfProductionData = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const reqMessage = `
  {
    count_product(
      where:{
        status:{
          eq: "up"
        },
        hasrepoplan:{
          eq: "yes"
        },
      },
      order: "-created"
    )
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      const tmp = reponse.data.data.count_product || 0

      dispatch({
        type: `${prefix}requestForTotalOfProductionData`,
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
