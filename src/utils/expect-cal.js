/* eslint-disable no-restricted-properties */
// result: 结果值
// duration: 收益期（天)
// dayProfit: 每日收益
// residual: 预期残值
// times: 计算次数()

/*
  sqrtx({
    result, @ 来自后台页面 supply * swaprank (y/x)
    duration, @ 来自后台页面 数据 接受数据是  1d/24h 为单位
    dayProfit, @ 来自 kdata newest data 最后一条 / 后台页面 产品数
    residual, @ 来自后台页面 attributes
  })
*/

const calStartParam = 100
const calLeftParam = -1
const calRightParam = 100

const expectCal = params => {
  const { result, duration, dayProfit, residual, times } = params

  if (!result || !duration || !dayProfit || parseFloat(residual) < 0) {
    return {
      data: null,
      message: 'param required',
    }
  }

  let itime = 0
  const x = result || 0
  const y = duration || 0
  const z = dayProfit || 0
  const a = residual || 0
  const b = times || 30

  const calc = (start = calStartParam, left = calLeftParam, right = calRightParam) => {
    // 求和
    let sum = 0
    for (let n = 1; n < y + 1; n += 1) {
      sum += z / Math.pow(1 + start, n / 365)
    }

    // 求比
    const dvi = a / Math.pow(1 + start, y / 365)

    // 结果
    const resultVal = sum + dvi
    itime += 1

    if (itime > b) {
      return {
        data: start,
        message: 'success',
      }
    }

    // 超出计算边界， 为错误数据
    if (start === calStartParam && resultVal > x) {
      return {
        data: null,
        message: 'error',
      }
    }

    if (start < -0.99995) {
      return {
        data: calLeftParam,
        message: 'overLimit',
      }
    }

    if (resultVal < x) {
      return calc((start + left) / 2, left, start)
    }

    return calc((start + right) / 2, start, right)
  }

  const val = calc()

  return val
}

export default expectCal
