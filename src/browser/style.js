import colors from 'grape-theme/dist/base-colors'
import sizes from 'grape-theme/dist/sizes'

export default {
  browser: {
    display: 'flex',
    flexDirection: 'column',
    background: colors.white,
    overflow: 'hidden',
    borderRadius: sizes.borderRadius.bigger,
    boxShadow: [
      'inset 0 1px 0 rgba(255,255,255,.6)',
      '0 22px 70px 4px rgba(0,0,0,0.56)',
      '0 0 0 1px rgba(0, 0, 0, 0.3)'
    ].join(','),
    position: 'relative',
    margin: '0 10%',
    height: 400,
    maxWidth: 920
  },
  column: {
    flex: 1,
    display: 'flex',
    // firefox 34+ flexbox bug workaround
    minHeight: 1
  },
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    // firefox 34+ flexbox bug workaround
    minWidth: 1
  },
  leftColumn: {
    flex: 6,
    overflowY: 'scroll'
  },
  rightColumn: {
    flex: 4,
    display: 'flex',
    minWidth: 256,
    maxWidth: 384,
    overflowX: 'hidden',
    overflowY: 'scroll'
  }
}
