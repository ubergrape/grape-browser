import React, {PureComponent, PropTypes} from 'react'
import * as icons from 'grape-web/lib/svg-icons/data'
import injectSheet from 'grape-web/lib/jss'

import {styles} from './theme'

@injectSheet(styles)
export default class ServiceIcon extends PureComponent {
  static propTypes = {
    sheet: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    icon: PropTypes.shape({
      type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    }).isRequired
  }

  static defaultProps = {
    icon: {
      type: 'id',
      value: 'file'
    },
    theme: {}
  }

  render() {
    const {sheet, theme, icon: {type, value}} = this.props
    const classes = theme.classes || sheet.classes

    // If `icon.type` is "url", use it.
    // If `icon.type` is an "id", look for an icon from the set or use a default icon.
    const iconUrl = type === 'url' ? value : (icons[value] || icons.file)
    const backgroundImage = `url(${iconUrl})`

    return (
      <span
        className={classes.icon}
        style={{backgroundImage}} />
    )
  }
}
