import React from 'react'
import useSheet from 'react-jss'
import dotpather from 'dotpather'

import detailStyle from './detailStyle'

let getImageUrl = dotpather('preview.image.url')

/**
 * Detail view for objects.
 */
export default React.createClass({
  mixins: [useSheet(detailStyle)],

  getDefaultProps() {
    return {
      height: null,
      className: '',
      data: {meta: []}
    }
  },

  render() {
    let {classes} = this.sheet
    let {data} = this.props

    let style = {
      height: `${this.props.height}px`
    }

    let previewUrl = getImageUrl(data)
    let preview
    if (previewUrl) {
      preview = <img src={previewUrl} width="100%" />
    }

    return (
      <div className={`${classes.container} ${this.props.className}`} style={style}>
        {preview}
        <div className={classes.contentWrapper}>
          <h2 className={classes.title}>{data.title}</h2>
          <h3 className={classes.subtitle}>{data.subtitle}</h3>
          <p className={classes.description}>{data.description}</p>
          {data.meta.map(item => {
            return (
              <div>
                <b>{item.label + ': '}</b>
                <span>{item.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})