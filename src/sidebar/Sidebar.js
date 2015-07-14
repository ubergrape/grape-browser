import React, {Component} from 'react'
import useSheet from 'react-jss'
import {shouldPureComponentUpdate} from 'react-pure-render'

import style from './style'

/**
 * Sidebar container.
 */
@useSheet(style)
export default class Sidebar extends Component {
  static defaultProps = {
    className: ''
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  render() {
    let {classes} = this.props.sheet

    return (
      <aside className={`${classes.sidebar} ${this.props.className}`}>
        {this.props.children}
      </aside>
    )
  }
}