import colors from 'grape-theme/dist/base-colors'
import color from 'color'
import fonts from 'grape-theme/dist/fonts'

export const text = {
  ...fonts.small,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

export const amount = {
  letterSpacing: 0,
  fontWeight: 'normal',
  marginLeft: 4,
  opacity: 0.75
}

export const container = {
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 12px',
  listStyleType: 'none',
  cursor: 'pointer',
  height: 34,
  color: color(colors.grapeTypo).alpha(0.7).rgbaString(),
  userSelect: 'none'
}

export const rules = {
  container: {
    ...container,
    '&:hover': {
      color: colors.grapeTypo
    }
  },
  containerSelected: {
    ...container,
    color: colors.grapeTypo,
    boxShadow: '0 2px 0 ' + colors.blue
  },
  text: text,
  amount: amount
}
