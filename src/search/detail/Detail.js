import React, {Component} from 'react'
import useSheet from 'react-jss'
import get from 'lodash-es/object/get'

import style from './style'
import * as utils from './utils'

/**
 * Detail view for objects.
 */
@useSheet(style)
export default class Detail extends Component {
  static defaultProps = {
    data: undefined,
    headerHeight: undefined,
    images: undefined
  }

  render() {
    let {classes} = this.props.sheet
    let data = this.props.data || {}

    let previewUrl = get(data, 'preview.image.url')
    let {iconUrl} = data
    let header
    if (previewUrl || iconUrl) {
      let headerStyle = {height: this.props.headerHeight + 'px'}
      header = (
        <header className={classes.header} style={headerStyle}>
          <img
            src={previewUrl || iconUrl}
            className={previewUrl ? classes.preview : classes.icon} />
        </header>
      )
    }

    if (!this.props.data) {
      return (
        <div className={`${classes.detail} ${classes.empty}`}>
          <img src={this.props.images.noDetail} />
          <span className={classes.emptyNote}>No Detail Infos for this Item</span>
        </div>
      )
    }

    return (
      <div className={classes.detail}>
        {header}
        <div className={classes.body}>
          <h2 className={classes.title}>{data.title}</h2>
          <h3 className={classes.subtitle}>{data.subtitle}</h3>
          <p className={classes.description}>{data.description}</p>
          {data.meta &&
            <div className={classes.metaContainer}>
              {data.meta.map(item => {
                return (
                  <div className={classes.metaRow}>
                    <div className={classes.metaLabel}>
                      {item.label}
                    </div>
                    <div className={classes.metaValue}>
                      {utils.formatDateMaybe(item.label, item.value)}
                    </div>
                  </div>
                )
              })}
            </div>
          }
        </div>
      </div>
    )
  }
}
