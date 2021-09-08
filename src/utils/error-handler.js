export const errorHandler = error => {
  // eslint-disable-next-line no-console
  console.error(error)
}

export const commonErrorHandler = (error, successFuc, failCallback) => {
  // if (!!error.response && !!error.response.data) {
  //   if (successFuc) return successFuc(error.response.data)

  //   return true
  // }

  errorHandler(error)
  let errorMassage = error.toString() || '请求失败'
  if (!!error.response && !!error.response.data && !!error.response.data.message) {
    errorMassage = error.response.data.message
  }

  if (
    !!error.response &&
    !!error.response.data &&
    !!error.response.data.errors &&
    !!error.response.data.errors[0] &&
    !!error.response.data.errors[0].message
  ) {
    errorMassage = error.response.data.errors[0].message
  }

  if (failCallback) {
    try {
      failCallback(error, errorMassage)
    } catch (err) {
      errorHandler(err)
    }
  }

  return true
}
