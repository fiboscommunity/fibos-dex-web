import React, { PureComponent } from 'react'
import moment from 'moment'

import Echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/axis'
import 'echarts/lib/component/axisPointer'

import styles from './price-line-chart.module.css'

class PriceLineChart extends PureComponent {
  constructor(props, context) {
    super(props, context)

    this.chart = null
  }

  componentDidMount() {
    const { id, xName, yName, data } = this.props

    this.chart = Echarts.init(window.document.getElementById(id))
    window.onresize = this.handleScroll

    this.chart.setOption(this.getOption(xName, yName, data))
  }

  componentDidUpdate(prevProps) {
    const { xName, yName, data, timestamp } = this.props

    if (timestamp !== prevProps.timestamp) {
      this.chart.setOption(this.getOption(xName, yName, data))
    }
  }

  getOption = (xName, yName, data) => {
    const defaultData = [
      {
        date: moment(new Date())
          .subtract(1, 'days')
          .endOf('day')
          .valueOf(),
        dslValue: 0,
      },
    ]

    return {
      xAxis: {
        type: 'category',
        name: xName || '',
        nameLocation: 'end',
        nameTextStyle: {
          padding: [12, 0, 0, 0],
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          // interval: 15,
          formatter: value => moment(new Date(value)).format('DD'),
        },
      },
      yAxis: {
        type: 'value',
        name: yName ? yName.split('@')[0] || '' : '',
        nameTextStyle: {
          align: 'right',
          padding: [0, 0, 0, 120],
        },
        scale: true,
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          type: 'line',
          clipOverflow: false,
          smooth: true,
          sampling: true,
          dimensions: ['date', 'dslValue'],
          encode: {
            x: 'date',
            y: 'dslValue',
          },
          silent: true,
        },
      ],
      dataset: {
        source: data.length === 0 ? defaultData : [...data],
      },
      animationDelay: 1000,
    }
  }

  handleScroll = () => {
    this.chart.resize()
  }

  render() {
    const { id } = this.props

    return <div className={styles.chart} id={id} />
  }
}

export default PriceLineChart
