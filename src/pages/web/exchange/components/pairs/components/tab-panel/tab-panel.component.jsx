import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'
import intl from 'react-intl-universal'
import queryString from 'query-string'

import Table from 'antd/lib/table'
import 'antd/lib/table/style/css'
import 'antd/lib/locale-provider/style/css'
import Icon from 'antd/lib/icon'

import noData from 'Assets/commons/noData.png'
import styles from './tab-panel.module.css'

const antIcon = <Icon type="loading" style={{ fontSize: 30 }} spin />

class TabPanel extends PureComponent {
  // getTableData = data => {
  //   console.log('data:', data)
  //   const { selectedSrcToken } = this.props
  //   console.log('selectedSrcToken:', selectedSrcToken)

  //   if (!data[selectedSrcToken]) return []
  //   return [...data[selectedSrcToken]]
  // }

  render() {
    const { tableData, columns, getTokens, requesting, requestDataOfCurrentpair } = this.props

    return (
      <div className={styles.wrapper}>
        <Table
          loading={{
            indicator: antIcon,
            size: 'large',
            spinning: requesting || requestDataOfCurrentpair,
          }}
          className={styles.table}
          rowKey={record => `${record.tokenxName}/${record.tokenyName}`}
          bordered={false}
          columns={columns}
          // dataSource={[...this.getTableData(tableData)]}
          dataSource={tableData}
          pagination={false}
          scroll={{ y: 386 }}
          onRow={record => {
            const { tokenxName, tokenyName } = record

            return {
              onClick: () => {
                if (tokenxName && tokenyName) {
                  getTokens(record, true)

                  const tmpUri = queryString.stringify({
                    x: tokenxName,
                    y: tokenyName,
                  })

                  const { history } = this.props

                  history.push({
                    pathname: '/exchange',
                    search: tmpUri,
                  })
                }
                return true
              },
            }
          }}
          locale={{
            emptyText: (
              <div className={styles.noDataWrapper}>
                <div className={styles.noDataImgWrapper}>
                  <img className={styles.noDataImg} src={noData} alt="" />
                </div>
                <div className={styles.noDataText}>{intl.get('RACORD_NO_DATA')}</div>
              </div>
            ),
          }}
        />
      </div>
    )
  }
}

export default withRouter(TabPanel)
