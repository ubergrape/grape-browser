import React, {Component, PropTypes} from 'react'
import List from 'react-finite-list'
import getColoredIcon from 'grape-web/lib/svg-icons/getColored'
import {useSheet} from 'grape-web/lib/jss'
import colors from 'grape-theme/dist/base-colors'

import style from './actionsStyle'

/**
 * Document actions.
 */
@useSheet(style)
export default class Actions extends Component {
  static propTypes = {
    sheet: PropTypes.object.isRequired,
    items: PropTypes.array,
    focused: PropTypes.bool,
    focusedAction: PropTypes.object,
    hoveredAction: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onSelect: PropTypes.func
  }

  static defaultProps = {
    focused: false
  }

  renderItem({item, focused}) {
    const {classes} = this.props.sheet
    let focusedClass = ''
    let iconColor = colors.grayBlueDark
    if (focused) {
      focusedClass = this.props.focused ? classes.actionFocused : classes.actionFocusedInactive
      if (this.props.focused) iconColor = colors.white
    }

    const hovered = this.props.hoveredAction === item
    if (hovered && !this.props.focused) {
      focusedClass = classes.actionFocused
      iconColor = colors.white
    }

    const icon = getColoredIcon({name: item.icon, color: iconColor})
    const backgroundImage = `url('${icon}')`

    return (
      <div
        className={`${classes.action} ${focusedClass}`}
        onMouseEnter={this.props.onFocus.bind(null, item)}
        onMouseLeave={this.props.onBlur.bind(null, item)}>
        <span style={{backgroundImage}} className={classes.icon} />
        <span className={classes.text}>{item.text}</span>
      </div>
    )
  }

  render() {
    const {classes} = this.props.sheet
    return (
      <List
        className={classes.actions}
        renderItem={::this.renderItem}
        items={this.props.items}
        onSelect={this.props.onSelect}
        focused={this.props.focusedAction}
        ref="list" />
    )
  }
}