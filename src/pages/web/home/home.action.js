import { commonErrorHandler, req, errorHandler } from 'Utils'

const prefix = 'Home_'

export const resetIronman = () => dispatch => {
  dispatch({
    type: `${prefix}resetIronman`,
  })
}
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

export const requestForAnnouncement = (filter, cbs) => dispatch => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  let filterStr = ''

  if (!!filter && !!filter.limit) {
    filterStr += `
        skip: 0,
        limit: ${filter.limit}
        `
  }

  const reqMessage = `
  {
    find_announcement(${filterStr}
      order: "-createdAt"
    ){
      id,
      title,
      content,
      type,
    }
  }`

  const successFuc = reponse => {
    if (
      !!reponse &&
      !!reponse.data &&
      !!reponse.data.data &&
      !!reponse.data.data.find_announcement
    ) {
      const tmp = reponse.data.data.find_announcement || []

      dispatch({
        type: `${prefix}requestForAnnouncement`,
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

export const clickAnnouncement = (id, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const failFuc = error => commonErrorHandler(error, successCallback, failCallback)

  const successFuc = reponse => {
    if (!!reponse && !!reponse.data && !!reponse.data.data) {
      dispatch({
        type: `${prefix}clickAnnouncement`,
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
  //   url: '/1.0/app/announcement/click',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: { id },
  // })
  //   .then(successFuc)
  //   .catch(failFuc)

  req
    .callApi('/1.0/app/announcement/click', 'post', { id })
    .then(successFuc)
    .catch(failFuc)
}
