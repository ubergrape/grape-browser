import fonts from 'grape-theme/dist/fonts'
import colors from 'grape-theme/dist/base-colors'

export default {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: 'solid 1px #E5E5E5'
  },
  icon: {
    color: colors.gainsboroDark,
    width: 40,
    flexShrink: 0,
    cursor: 'pointer'
  },
  input: {
    ...fonts.big,
    width: '100%',
    color: colors.grapeTypo,
    border: 'none',
    padding: 15,
    paddingLeft: 0,
    outline: 'none'
  }
}
