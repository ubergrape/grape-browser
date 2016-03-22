import colors from 'grape-theme/dist/base-colors'
import fonts from 'grape-theme/dist/fonts'
import utils from 'grape-jss-utils'

export default {
  header: {
    display: 'flex',
    flexShrink: 0,
    background: colors.grayBlueLighter,
    padding: '5px 12px'
  },
  text: {
    ...fonts.smaller,
    ...utils.ellipsis,
    flex: 3,
    lineHeight: '1em',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.gainsboroDark
  },
  hint: {
    extend: 'text',
    flexShrink: 0,
    flex: 1,
    textAlign: 'right'
  }
}
