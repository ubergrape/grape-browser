'use strict'

import React from 'react'
import useSheet from 'react-jss'
import facetStyle from './facetStyle'

/**
 * One facet tab.
 */
var Facet = React.createClass({
  mixins: [useSheet(facetStyle)],

  render() {
    var classes = this.sheet.classes
    var label = this.props.label
    if (this.props.amount != null) label += ' (' + this.props.amount + ')'
    var className = this.props.active ? classes.containerActive : classes.container
    return <li className={className} onClick={this.onActivate}>{label}</li>
  },

  onActivate() {
    this.props.setActive(this.props.service)
  }
})

export default Facet
