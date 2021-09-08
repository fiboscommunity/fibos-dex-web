import React, { useEffect } from 'react'
import { BigNumber } from 'bignumber.js'
import Echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/axis'
import 'echarts/lib/component/axisPointer'

const wd = window.document
const bidColor = 'rgba(205,0,0,1)'
const askColor = 'rgba(0,205,0,1)'
const placeholderColor = 'rgb(97,105,137)'
const margin = 10

function processData(depthMap) {
  const prices = []
  const amountsBuy = []
  const amountsSell = []

  if (!depthMap) {
    return { prices, amountsBuy, amountsSell }
  }

  for (let i = 0; i < depthMap.buy.length; i += 1) {
    const price = new BigNumber(depthMap.buy[i].price).toString()
    const totalAmount = new BigNumber(depthMap.buy[i].totalamount).toString()
    prices.push(price)
    amountsBuy.push(totalAmount)
    amountsSell.unshift('-')
  }

  prices.push(depthMap.lastprice)
  amountsBuy.push(0)
  amountsSell.push(0)

  for (let i = 0; i < depthMap.sell.length; i += 1) {
    const price = new BigNumber(depthMap.sell[i].price).toString()
    const totalAmount = new BigNumber(depthMap.sell[i].totalamount).toString()
    prices.push(price)
    amountsSell.push(totalAmount)
    amountsBuy.push('-')
  }

  return {
    prices,
    amountsBuy,
    amountsSell,
  }
}

let myChart = null

export default function DepthChart(props) {
  const {
    depthMap,
    setPricesOfPriceLimit,
    srcToken,
    dstToken,
  } = props

  function handleDepthMap() {
    const { prices, amountsBuy, amountsSell } = processData(depthMap)
    const option = {
      title: {
        show: false,
      },
      color: [askColor, bidColor],
      legend: {
        show: true,
        type: 'plain',
        top: 10,
        padding: [0, 0, 0, 0],
        itemGap: 40,
        itemWidth: 13,
        selectedMode: false,
        backgroundColor: 'transparent',
        data: [
          {
            name: '买入',
            icon: 'rect',
            textStyle: {
              color: placeholderColor,
            },
          },
          {
            name: '卖出',
            icon: 'rect',
            textStyle: {
              color: placeholderColor,
            },
          },
        ],
      },
      grid: {
        show: true,
        left: margin,
        top: margin,
        right: margin,
        bottom: 1,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        tooltip: {
          show: true,
          trigger: 'item',
          position: 'inside',
        },
      },
      yAxis: {
        show: true,
        gridIndex: 0,
        position: 'bottom',
        offset: 0,
        type: 'category',
        inverse: false,
        boundaryGap: false,
        slient: false,
        data: prices,
        axisLine: {
          show: true,
          symbol: 'arrow',
          lineStyle: {
            color: placeholderColor,
          },
        },
        axisTick: {
          show: true,
          inside: true,
          length: 0,
        },
        axisLabel: {
          show: true,
          interval: () => false,
          inside: true,
        },
        splitLine: {
          show: false,
        },
      },
      xAxis: [
        {
          show: true,
          position: 'left',
          offset: 0,
          type: 'value',
          boundaryGap: false,
          scale: true,
          minInterval: 1,
          maxInterval: 3600 * 24 * 1000,
          // interval: 254,
          silent: false,
          axisLine: {
            show: true,
            onZero: true,
            lineStyle: {
              color: placeholderColor,
            },
          },
          axisTick: {
            show: true,
            inside: true,
            lineStyle: {
              type: 'dashed',
              width: 0,
            },
          },
          axisLabel: {
            show: true,
            inside: true,
            margin: 5,
            formatter: '{value}',
            showMinLabel: true,
            showMaxLabel: true,
            color: placeholderColor,
            fontSize: 14,
          },
          splitLine: {
            show: false,
          },
        },
        {
          show: true,
          position: 'right',
          axisLine: {
            show: true,
            onZero: true,
            lineStyle: {
              color: placeholderColor,
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      tooltip: {
        show: true,
        trigger: 'axis',
        // formatter: '单价: {b0}<br />数量: {c0}',
        formatter: arg => {
          const N = BigNumber
          const { name, data } = arg
          const price = new N(name).toFixed(srcToken.pre)
          const quantity = new N(data).toFixed(dstToken.pre)
          return `价格: ${price}<br />数量: ${quantity}`
        },
        axisPointer: {
          show: true,
          type: 'cross',
          axis: 'x',
          snap: true,
          label: {
            show: false,
            precision: 2,
            margin: 0,
          },
          lineStyle: {
            color: 'transparent',
            width: 0,
            type: 'dashed',
          },
        },
        showContent: true,
        alwaysShowContent: false,
        hideDelay: 5,
        enterable: false,
        snapshot: true,
        confine: true,
        transitionDuration: 0.3,
        data: [
          {
            name: 'aa',
            icon: 'circle',
            textStyle: {
              color: 'red',
            },
          },
        ],
      },
      series: [
        {
          type: 'line',
          name: '买入',
          coordinateSystem: 'cartesian2d',
          hoverAnimation: true,
          legendHoverLink: true,
          cursor: 'pointer',
          connectNulls: true,
          clipOverflow: true,
          lineStyle: {
            normal: {
              color: askColor,
              width: 1,
            },
          },
          areaStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(0,205,0,0.9)',
                  },
                  {
                    offset: 0.5,
                    color: 'rgba(0,205,0,0.6)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(0,205,0,0.3)',
                  },
                ],
              },
              origin: 'auto',
            },
          },
          // step: true,
          data: amountsBuy,
          animation: false,
        },
        {
          name: '卖出',
          type: 'line',
          // step: true,
          lineStyle: {
            normal: {
              color: bidColor,
              width: 1,
            },
          },
          areaStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(205,0,0,0.9)',
                  },
                  {
                    offset: 0.5,
                    color: 'rgba(205,0,0,0.6)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(205,0,0,0.3)',
                  },
                ],
              },
            },
          },
          data: amountsSell,
          animation: false,
        },
      ],
    }
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  }

  function handleScroll() {
    myChart.resize()
  }

  useEffect(() => {
    myChart = Echarts.init(wd.getElementById('__echartsId'))
    window.onresize = handleScroll
    myChart.on('click', params => {
      const types = ['buy', 'sell']
      const type = types[Number(params.seriesIndex)]
      const price = params.name
      setPricesOfPriceLimit(type, price)
    })
  }, [])

  useEffect(() => {
    if (myChart) {
      handleDepthMap()
    } else {
      // eslint-disable-next-line no-console
      console.warn('DepthMap not ready')
    }
  }, [depthMap])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#171a2a',
        borderRadius: '2px',
      }}
      id="__echartsId"
    />
  )
}
