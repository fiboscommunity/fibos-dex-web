/* eslint-disable camelcase */
import React, { useEffect } from 'react'

import { host } from 'Config'

import Card from '../card'
import styles from './candlestick-chart.module.css'
import Ticker from './ticker'

const resolutions = [
  {
    title: '1min',
    resolution: '1',
  },
  {
    title: '5min',
    resolution: '5',
  },
  {
    title: '15min',
    resolution: '15',
  },
  {
    title: '30min',
    resolution: '30',
  },
  {
    title: '1hour',
    resolution: '60',
  },
  {
    title: '4hour',
    resolution: '240',
  },
  {
    title: '1day',
    resolution: '1D',
  },
  {
    title: '1week',
    resolution: '1W',
  },
  {
    title: '1month',
    resolution: '1M',
  },
]

const disabled_features = [
  'header_saveload',
  'compare_symbol',
  'display_market_status',
  'go_to_date',
  'header_chart_type',
  'header_compare',
  'header_interval_dialog_button',
  'header_resolutions',
  'header_screenshot',
  'header_symbol_search',
  'header_undo_redo',
  'legend_context_menus',
  'show_hide_button_in_legend',
  'show_interval_dialog_on_key_press',
  'snapshot_trading_drawings',
  'symbol_info',
  'timeframes_toolbar',
  'use_localstorage_for_settings',
]

const enabled_features = [
  'dont_show_boolean_study_arguments',
  'hide_last_na_study_output',
  'move_logo_to_main_pane',
  'same_data_requery',
  'side_toolbar_in_fullscreen_mode',
]

// const colorRed = 'rgba(180, 72, 80, .5)'
// const colorGreen = 'rgba(10, 193, 126, .5)'

const colorRed = '#d74e5a'
const colorGreen = '#41b37d'

const overrides = {
  volumePaneSize: 'medium',
  'paneProperties.background': '#181B2A',
  'paneProperties.legendProperties.showLegend': false,
  'scalesProperties.backgroundColor': '#ff0000',
  'symbolWatermarkProperties.color': 'rgba(0, 0, 0, 0)',
  'paneProperties.vertGridProperties.color': '#222634', // 网格线颜色
  'paneProperties.horzGridProperties.color': '#222634',
  'symbolWatermarkProperties.transparency': 90,
  'scalesProperties.textColor': '#AAA',
  'mainSeriesProperties.areaStyle.color1': 'rgba(122, 152, 247, 0.1)',
  'mainSeriesProperties.areaStyle.color2': 'rgba(122, 152, 247, .02)',
  'mainSeriesProperties.areaStyle.linecolor': '#4e5b85',
  'mainSeriesProperties.areaStyle.linewidth': 1,
  'mainSeriesProperties.areaStyle.priceSource': 'close',
  'mainSeriesProperties.candleStyle.upColor': colorGreen,
  'mainSeriesProperties.candleStyle.downColor': colorRed,
  'mainSeriesProperties.candleStyle.borderUpColor': colorGreen,
  'mainSeriesProperties.candleStyle.borderDownColor': colorRed,
  'mainSeriesProperties.candleStyle.wickUpColor': colorGreen,
  'mainSeriesProperties.candleStyle.wickDownColor': colorRed,
}

const studies_overrides = {
  'volume.volume.color.0': colorRed,
  'volume.volume.color.1': colorGreen,
}

function loadChart(props) {
  const { symbol } = props
  const Widget = window.TradingView.widget

  window.tvWidget = new Widget({
    width: '100%',
    height: '100%',
    symbol,
    interval: '1D',
    container_id: 'chart_container', // 容器元素ID
    datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
      `${host}/1.0/chart`,
      // `${window.location.origin}/1.0/chart`,
      5000,
    ),
    // library_path: '../charting_library/',
    library_path: 'charting_library/',
    locale: 'zh',
    drawings_access: {
      type: 'black',
      tools: [{ name: 'Regression Trend' }],
    },
    disabled_features,
    enabled_features,
    charts_storage_url: 'https://saveload.tradingview.com',
    charts_storage_api_version: '1.1',
    client_id: '', // TODO  应该改为我们邮箱申请的帐号
    user_id: '', // TODO  应该改为我们邮箱申请的帐号
    loading_screen: { backgroundColor: '#181B2A' },
    toolbar_bg: '#181B2A',
    overrides,
    studies_overrides,
    time_frames: [],
    timezone: 'Asia/Shanghai',
    custom_css_url: './mychart.css',
    chartType: 1,
  })

  const widget = window.tvWidget
  widget.onChartReady(() => {
    const chart = widget.chart()
    chart.createStudy('Volume', false, false) // 成交量
    const l1 = chart.createStudy('Moving Average', false, false, [5], null, {
      // 均线
      'Plot.linewidth': 1,
    })
    const l2 = chart.createStudy('Moving Average', false, false, [10], null, {
      'Plot.linewidth': 1,
    })
    const l3 = chart.createStudy('Moving Average', false, false, [30], null, {
      'Plot.linewidth': 1,
    })
    const l4 = chart.createStudy('Moving Average', false, false, [60], null, {
      'Plot.linewidth': 1,
    })

    function setAllStudiesVisibility(visiable) {
      chart.setEntityVisibility(l1, visiable)
      chart.setEntityVisibility(l2, visiable)
      chart.setEntityVisibility(l3, visiable)
      chart.setEntityVisibility(l4, visiable)
    }

    const s1 = window.document.createElement('span') // 分时
    s1.innerHTML = '分时'
    s1.className = 'relabel'
    widget
      .createButton()
      .on('click', () => {
        setAllStudiesVisibility(false)
        if (chart.chartType() === 1) {
          chart.setChartType(3)
        } else {
          chart.setChartType(1)
        }
      })
      .append(s1)

    resolutions.forEach(({ title, resolution }) => {
      const s = window.document.createElement('span')
      s.innerHTML = title
      s.className = 'rebutton'
      widget
        .createButton()
        .attr('title', title)
        .addClass(resolution === '1D' ? 'selected' : '')
        .on('click', e => {
          setAllStudiesVisibility(true)

          const iframeId = document.getElementsByTagName('iframe')[0].getAttribute('id')
          if (chart.chartType() !== 1) chart.setChartType(1)

          const preBtn = document
            .getElementById(iframeId)
            .contentWindow.document.getElementsByClassName('selected')[0]
          if (preBtn) {
            preBtn.setAttribute('class', 'button')
          }
          e.currentTarget.setAttribute('class', 'button selected')
          chart.setResolution(resolution) // 点击分时的时候 需要切换 resolution
        })
        .append(s)
    })

    chart.executeActionById('drawingToolbarAction')
  })

  return widget
}

let widget = null

function CandlestickChart(props) {
  const {
    symbol,
    pre,
    pricePre,
    detailData,
    dstTokenName,
    srcTokenName,
    needToReverse,
    lastPrice,
  } = props
  const {
    oneDayKdata,
    spinning,
    transPairDetail: { uniswapPrice },
  } = props

  useEffect(() => {
    if (window.__tradingViewReady === true) {
      widget = loadChart(props)
    } else {
      window.TradingView.onready(() => {
        window.__tradingViewReady = true
        widget = loadChart(props)
      })
    }

    return function cleanup() {
      if (widget && widget._ready) {
        widget.remove()
        widget = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (widget && widget._ready) {
      widget.chart().setSymbol(symbol)
    } else if (widget) {
      widget.onChartReady(() => {
        widget.chart().setSymbol(symbol)
      })
    }
  }, [symbol])

  return (
    <Card className={styles.wrapper}>
      <div className={styles.chart_header}>
        <Ticker
          dstTokenName={dstTokenName}
          srcTokenName={srcTokenName}
          needToReverse={needToReverse}
          oneDayKdata={oneDayKdata}
          spinning={spinning}
          price={uniswapPrice}
          pricePre={pricePre}
          symbol={symbol}
          detailData={detailData}
          pre={pre}
          lastPrice={lastPrice}
        />
      </div>
      <div className={styles.chart_body}>
        <div id="chart_container" className={styles.chart_container} />
      </div>
    </Card>
  )
}

export default CandlestickChart
