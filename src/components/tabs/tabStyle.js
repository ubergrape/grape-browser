import colors from 'grape-theme/base-colors'
import color from 'color'
import fonts from 'grape-theme/fonts'

export let text = {
  extend: fonts.small,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

export let amount = {
  letterSpacing: 0,
  fontWeight: 'normal',
  marginLeft: 4,
  opacity: 0.75
}

export let container = {
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 12px',
  listStyleType: 'none',
  cursor: 'pointer',
  height: 32,
  color: color(colors.grapeTypo).alpha(0.7).rgbaString(),
  userSelect: 'none'
}

export let rules = {
  container: {
    extend: container,
    '&:hover': {
      color: colors.grapeTypo
    }
  },
  containerSelected: {
    extend: container,
    color: colors.grapeTypo,
    boxShadow: '0 2px 0 ' + colors.grapeLight
  },
  text: text,
  amount: amount
}
