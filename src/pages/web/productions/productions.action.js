import moment from 'moment'
import BigNumber from 'bignumber.js'

import { repoAccount } from 'Config'
import {
  getPrecision,
  getStrWithPrecision,
  commonErrorHandler,
  req,
  getDataListFromDataForCal,
  errorHandler,
} from 'Utils'

const prefix = 'Productions_'

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

export const requestForProductionsTableData = (filter, cbs) => (dispatch /* , getState */) => {
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
        },`

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
        maximum_exchange,
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
        token_names: pairData.map(item => item.pair),
        stime,
        etime,
      })
      .then(reponse => {
        if (reponse.data) {
          const withRepoData = toHandleData.map((item, index) => {
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

          dispatch({
            type: `${prefix}requestForProductionsTableData`,
            data: withRepoData,
            loadedPrice: true,
            loadedQuantity: false,
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

      // dispatch({
      //   type: `${prefix}requestForProductionsTableData`,
      //   data: [...tmpReponse],
      //   loadedPrice: false,
      //   loadedQuantity: false,
      // })

      if (pairQueue.length === 0) return

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

                const uniswapPrice = new BigNumber(tokenyQuantity).div(tokenxQuantity)

                tmpPairDetail = {
                  totalWeights,
                  tokenxQuantity,
                  tokenxSymbol,
                  tokenxContract,
                  tokenyQuantity,
                  tokenySymbol,
                  tokenyContract,
                  uniswapPrice: getStrWithPrecision(uniswapPrice, pairQueue[index].tokenxPre),
                }
              }

              return {
                ...item,
                ...tmpPairDetail,
              }
            })

            requestForAverageReo(pairQueue, result)
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

export const requestForTableDataTotalOfProductions = (filter, cbs) => dispatch => {
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
      },
      order: "-created"
    )
  }`

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      const tmp = reponse.data.data.count_product || 0

      dispatch({
        type: `${prefix}requestForTableDataTotalOfProductions`,
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
