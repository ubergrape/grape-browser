import colors from 'grape-theme/dist/base-colors'
import fonts from 'grape-theme/dist/fonts'

const iconsWidth = 65
const tokenVerticalIndent = -1
const tokenHorizontalIndent = -2
const tokenPostion = {
  left: tokenHorizontalIndent,
  right: tokenHorizontalIndent,
  top: tokenVerticalIndent,
  bottom: tokenVerticalIndent
}

const fontFamily = 'Arial, Helvetica, sans-serif'

export default {
  wrapper: {
    font: fonts.normal.fontSize + '/' + '22px' + ' ' + fontFamily,
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 38,
    boxSizing: 'border-box',
    paddingRight: iconsWidth
  },

  common: {
    overflow: 'hidden',
    minHeight: 38,
    boxSizing: 'border-box',
    padding: 9,
    textRendering: 'auto'
  },

  textarea: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    outline: 'none',
    background: 'transparent',
    border: 'none',
    color: colors.grapeDark,
    resize: 'none'
  },

  highlighter: {
    position: 'absolute',
    left: '0',
    top: '0',
    right: iconsWidth,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    color: 'transparent'
  },

  token: {
    position: 'relative',
    boxSizing: 'border-box',
    padding: '2px 0',
    '&:before': {
      position: 'absolute',
      ...tokenPostion,
      content: '""',
      borderRadius: 3
    }
  },

  // TODO: this copy/paste to be refactored after token design will be ready
  'room': {
    '&:before': {
      border: '1px solid #e2c8f0',
      background: 'linear-gradient(0deg, #e2c8f0, #e6d0f2)'
    }
  },

  'user': {
    '&:before': {
      border: '1px solid #75c7e5',
      background: 'linear-gradient(0deg, #75c7e5, #83d3f0)'
    }
  },

  'search': {
    '&:before': {
      border: '1px solid #b8e7aa',
      background: 'linear-gradient(0deg, #b8e7aa, #c3ebb7)'
    }
  },

  'emoji': {
    '&:before': {
      border: '1px solid #fbd6d6',
      background: 'linear-gradient(0deg, #fbd6d6, #fbdddd)'
    }
  }
}