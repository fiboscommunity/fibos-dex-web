import moment from 'moment'
import BigNumber from 'bignumber.js'

import { Token } from 'Datasets'

import {
  commonErrorHandler,
  getStrWithPrecision,
  req,
  getDataListFromDataForCal,
  errorHandler,
} from 'Utils'
import { repoAccount } from 'Config'

const prefix = 'ProductionDetail_'

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

export const requestForProductionData = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        id:{
          eq: ${filter.id}
        },
        hasrepoplan:{
          eq: "yes"
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
      } = tmp

      const tmpPlan = repoplan.plan

      const result = {
        id: id || undefined,
        name: name || undefined,
        token: new Token(token) || {},
        imghash: imghash || undefined,
        status: status || undefined,
        description: description.split('\n') || undefined,
        amount: amount || undefined,
        company: company || undefined,
        attributes: attributes || {},
        repoplan: {
          ...repoplan,
          plan:
            Object.prototype.toString.call(tmpPlan) === '[object String]'
              ? tmpPlan.split('\n')
              : [],
        },
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForTokenData = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        id:{
          eq: "${filter.id}"
        }`

  const reqMessage = `
  {
    find_token(
      where:{${filterStr}
      },
    ){
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
      !!reponse.data.data.find_token &&
      !!reponse.data.data.find_token[0]
    ) {
      const tmp = reponse.data.data.find_token[0] || []

      dispatch({
        type: `${prefix}requestForTokenData`,
        data: { ...tmp },
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForTokenPairData = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        tokenx_id:{
          eq: "${filter.tokenx}"
        }
        tokeny_id:{
          eq: "${filter.tokeny}"
        }`

  const reqMessage = `
  {
    find_tokenpair(
      where:{${filterStr}
      },
    ){
      id,
      tokenx {
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
      tokeny {
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
      !!reponse.data.data.find_tokenpair &&
      !!reponse.data.data.find_tokenpair[0]
    ) {
      const tmp = reponse.data.data.find_tokenpair[0] || []

      const result = filter.reverse ? new Token(tmp.tokeny) : new Token(tmp.tokenx)

      dispatch({
        type: `${prefix}requestForTokenPairData`,
        data: result,
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}

export const requestForIssueRecordData = (tokenName, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = `
        token_id:{
          eq: "${tokenName}"
        },`

  const reqMessage = `
  {
    find_issuerecord(
      where:{${filterStr}
      },
    ){
      id,
      quantity,
      to,
      memo,
      type,
      createdAt,
      updatedAt,
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
      !!reponse.data.data.find_issuerecord
    ) {
      const tmp = reponse.data.data.find_issuerecord || []

      dispatch({
        type: `${prefix}requestForIssueRecordData`,
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

export const getSwapRankTotal = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny } = data

  const successFuc = reponse => {
    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.data &&
      Object.prototype.toString.call(reponse.data.data) === '[object Array]'
    ) {
      const tmpData = [...reponse.data.data]

      const totalResData = tmpData.pop()

      let tmpPairDetail = {}

      let totalWeights = 0
      if (Object.keys(totalResData).length > 0) {
        totalWeights = totalResData.total_weights

        let needToReverse = false
        if (totalResData.tokeny === tokenx) {
          needToReverse = true
        }

        const tmpTokenx = needToReverse ? totalResData.tokeny : totalResData.tokenx
        const tmpTokeny = needToReverse ? totalResData.tokenx : totalResData.tokeny

        const tokenxQuantity = needToReverse
          ? totalResData.tokeny_quantity
          : totalResData.tokenx_quantity
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
          tokenxQuantity,
          tokeny: tokenyObj,
          tokenyQuantity,
          totalWeights,
          uniswapPrice,
        }
      }

      dispatch({
        type: `${prefix}getSwapRankTotal`,
        data: { ...tmpPairDetail },
      })

      if (successCallback) {
        try {
          successCallback(tmpPairDetail)
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

export const getAverageRepo = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny } = data

  const successFuc = reponse => {
    if (reponse.data[0].dateLists) {
      const tmpDateLists = reponse.data[0].dateLists ? reponse.data[0].dateLists || [] : []

      let average = null

      if (tmpDateLists.length > 0) {
        const filteredDateLists = getDataListFromDataForCal(tmpDateLists)

        average = filteredDateLists
          .reduce(
            (accumulator, currentValue) => accumulator.plus(currentValue.quantitys || 0),
            new BigNumber(0),
          )
          .div(filteredDateLists.length > 7 ? 7 : filteredDateLists.length)

        // let lastQuantityZeroIndex = 0
        // average = filteredDateLists
        //   .reduce((accumulator, currentValue, currentIndex) => {
        //     if (
        //       new BigNumber(currentValue.quantitys).eq(0) &&
        //       (lastQuantityZeroIndex === currentIndex - 1 || currentIndex === 0)
        //     ) {
        //       lastQuantityZeroIndex = currentIndex
        //     }

        //     return accumulator.plus(currentValue.quantitys || 0)
        //   }, new BigNumber(0))
        //   .div(
        //     filteredDateLists.length > 7
        //       ? 7 - lastQuantityZeroIndex - 1
        //       : filteredDateLists.length - lastQuantityZeroIndex - 1,
        //   )
      }

      dispatch({
        type: `${prefix}getAverageRepo`,
        data: average,
      })

      if (successCallback) {
        try {
          successCallback(average)
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
  //     token_names: [`${tokenx}/${tokeny}`],
  //     stime,
  //     etime,
  //   },
  // })

  req
    .callApi('/1.0/app/deal/kdata', 'post', {
      duration: '1d',
      account: repoAccount,
      token_names: [`${tokeny}/${tokenx}`],
      stime,
      etime,
    })
    .then(successFuc)
    .catch(failFuc)
}

export const getPriceMonthly = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny, pre } = data

  const successFuc = reponse => {
    if (reponse.data[0].dateLists) {
      const tmpDateLists = reponse.data[0].dateLists ? reponse.data[0].dateLists || [] : []

      // const dataZoomStartTimestamp = moment(tmpDateLists[0].datatime)
      //   .endOf('day')
      //   .startOf('hour')
      //   .valueOf()

      // const dataZoomEndTimestamp = moment(tmpDateLists[tmpDateLists.length - 1].datatime)
      //   .endOf('day')
      //   .startOf('hour')
      //   .valueOf()

      // const dayTimeBuckets = []
      // for (let index = 0; index < 30; index += 1) {
      //   const tmpDateItem = dataZoomStartTimestamp + 86400000 * index

      //   if (tmpDateItem <= dataZoomEndTimestamp) {
      //     dayTimeBuckets[index] = tmpDateItem
      //   }
      // }

      // const result = []
      // tmpDateLists.forEach(item => {
      //   const { datatime, nprice } = item

      //   if (dayTimeBuckets.indexOf(datatime) >= 0) {
      //     result.push([datatime, parseFloat(getStrWithPrecision(nprice, pre))])
      //   }
      // })

      const result = tmpDateLists.map(item => {
        const { datatime, nprice } = item

        return [datatime, parseFloat(getStrWithPrecision(nprice, pre))]
      })

      dispatch({
        type: `${prefix}getPriceMonthly`,
        data: [...result],
        timestamp: new Date().valueOf(),
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

  const stime = moment(new Date())
    .subtract(30, 'days')
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
  //     token_names: [`${tokenx}/${tokeny}`],
  //     stime,
  //     etime,
  //   },
  // })

  req
    .callApi('/1.0/app/deal/kdata', 'post', {
      duration: '1d',
      // duration: '1h',
      token_names: [`${tokenx}/${tokeny}`],
      stime,
      etime,
    })
    .then(successFuc)
    .catch(failFuc)
}

export const getEarningMonthly = (data, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const { tokenx, tokeny } = data

  const successFuc = reponse => {
    if (reponse.data[0].dateLists) {
      const tmpDateLists = reponse.data[0].dateLists ? reponse.data[0].dateLists || [] : []
      const dataZoomStartTimestamp = moment(tmpDateLists[0].datatime)
        .startOf('day')
        .valueOf()

      const dataZoomEndTimestamp = moment(tmpDateLists[tmpDateLists.length - 1].datatime)
        .startOf('day')
        .valueOf()

      const dayTimeBuckets = []
      for (let index = 0; index < 30; index += 1) {
        const tmpDateItem = dataZoomStartTimestamp + 86400000 * index

        if (tmpDateItem <= dataZoomEndTimestamp) {
          dayTimeBuckets[index] = tmpDateItem
        }
      }
      const dayDataBuckets = {}
      // let dayDataBucketsIndex = 0

      let currentTimestamp = dataZoomStartTimestamp

      tmpDateLists.forEach(item => {
        const { datatime } = item
        const quantitys = item.quantitys || 0

        if (datatime - currentTimestamp < 86400000) {
          if (!dayDataBuckets[currentTimestamp]) dayDataBuckets[currentTimestamp] = []

          dayDataBuckets[currentTimestamp].push(quantitys)
        } else {
          currentTimestamp += 86400000
          dayDataBuckets[currentTimestamp] = []
          dayDataBuckets[currentTimestamp].push(quantitys)
        }
      })

      const result = []

      dayTimeBuckets.forEach(item => {
        const tmpQuantitysArr = dayDataBuckets[item] || []

        let tmpQuantitysTotal = new BigNumber(0)

        tmpQuantitysTotal = tmpQuantitysArr.reduce(
          (accumulator, currentValue) => accumulator.plus(currentValue || 0),
          new BigNumber(0),
        )

        result.push([item, tmpQuantitysTotal.toNumber()])
      })

      dispatch({
        type: `${prefix}getEarningMonthly`,
        data: [...result],
        timestamp: new Date().valueOf(),
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

  const stime = moment(new Date())
    .subtract(30, 'days')
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
  //     token_names: [`${tokenx}/${tokeny}`],
  //     account: repoAccount,
  //     stime,
  //     etime,
  //   },
  // })

  req
    .callApi('/1.0/app/deal/kdata', 'post', {
      duration: '1h',
      token_names: [`${tokeny}/${tokenx}`],
      account: repoAccount,
      stime,
      etime,
    })
    .then(successFuc)
    .catch(failFuc)
}
