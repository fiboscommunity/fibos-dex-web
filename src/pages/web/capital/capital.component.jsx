import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'

import CapitalTable from './components/capital-table'
import CapitalSearch from './components/capital-search'
import styles from './capital.module.css'

class Capital extends PureComponent {
  componentDidUpdate() {
    const { ironmanData } = this.props
    if (!ironmanData) {
      // this._goto('/')
    }
  }

  _goto = (pathname, ops) => {
    const { history } = this.props

    history.push({
      pathname,
      state: {
        ...ops,
      },
    })
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.formWrapper}>
          <div className={styles.searchWrapper}>
            <CapitalSearch />
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <CapitalTable />
        </div>
      </div>
    )
  }
}

export default withRouter(Capital)
