import { commonErrorHandler, req, errorHandler } from 'Utils'

const prefix = 'Announcements_'

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

export const requestForAnnouncements = (filter, cbs) => (dispatch /* , getState */) => {
  let successCallback = null
  let failCallback = null

  if (cbs) {
    successCallback = cbs.successCb
    failCallback = cbs.failCb
  }

  const filterStr = ''

  const reqMessage = `
  {
    find_announcement(
      where:{${filterStr}
      },
      order: "-createdAt"
    ){
      id,
      title,
      content,
      type,
      clickamount,
      user {
        id,
        ownerpubkey,
        activepubkey,
        role,
      },
      status,
      imghash,
      createdAt,
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
      !!reponse.data.data.find_announcement
    ) {
      const tmp = reponse.data.data.find_announcement || []

      dispatch({
        type: `${prefix}requestForAnnouncements`,
        data: [...tmp],
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

  req
    .callGraphql('/1.0/app', reqMessage)
    .then(successFuc)
    .catch(failFuc)
}
