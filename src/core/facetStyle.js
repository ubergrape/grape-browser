'use strict'

import colors from 'ubergrape-theme/base-colors'
import Color from 'color'
import fonts from 'ubergrape-theme/fonts'

var container = {
  extend: fonts.small,
  position: 'relative',
  display: 'inline-block',
  padding: '8px 16px 8px',
  listStyleType: 'none',
  cursor: 'pointer',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  color: Color(colors.white).alpha(.5).hslString()
}

export default {
  container: container,
  containerSelected: {
    extend: container,
    background: colors.grapeLight,
    color: colors.white,
    '&:after': {
      position: 'absolute',
      top: '100%',
      left: '50%',
      content: '" "',
      height: 0,
      width: 0,
      border: '6px solid transparent',
      borderTopColor: colors.grapeLight,
      marginLeft: '-6px'
    }
  }
}
