'use strict'

import React from 'react'
import List from '../../common/list/List'

/**
 * All search results.
 */
var Github = React.createClass({
  render() {
    return <List data={this.props.data} />
  }
})

export default Github
