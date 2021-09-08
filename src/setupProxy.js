/* eslint-disable */
const proxy = require('http-proxy-middleware')

const protocol = 'http'

const hostPort = '210.74.14.225:8888'
// const hostPort = '223.201.1.41:80'

module.exports = function(app) {
  app.use(
    // proxy('/1.0/app', {
    //   target: `${protocol}://${hostPort}`,
    //   changeOrigin: true,
    // }),
    // proxy('/1.0/fileProc/', {
    //   target: `${protocol}://${hostPort}`,
    //   changeOrigin: true,
    // }),
    // proxy('/1.0/chart', {
    //   target: `${protocol}://${hostPort}`,
    //   changeOrigin: true,
    // }),
    proxy('/blank', {
      target: `${protocol}://${hostPort}`,
      changeOrigin: true,
    }),
  )
}
