import fonts from 'grape-theme/dist/fonts'
import colors from 'grape-theme/dist/base-colors'
import getColoredIcon from 'grape-web/lib/svg-icons/getColored'

const iconSize = 32
const margin = 15

const magnifierIcon = getColoredIcon({name: 'magnifier', color: colors.blue})
const plusIcon = getColoredIcon({name: 'plus', color: colors.blue})

export default {
  searchInput: {
    display: 'flex',
    borderBottom: `1px solid ${colors.silverDark}`
  },
  magnifierIcon: {
    flexShrink: 0,
    height: iconSize - 10,
    width: iconSize - 10,
    background: `no-repeat url('${magnifierIcon}')`,
    backgroundSize: 'contain',
    alignSelf: 'center',
    margin
  },
  plusButton: {
    flexShrink: 0,
    height: iconSize,
    width: iconSize,
    background: `no-repeat center url('${plusIcon}')`,
    border: `1px solid ${colors.grayLight}`,
    borderRadius: 5,
    alignSelf: 'center',
    margin,
    cursor: 'pointer'
  },
  container: {
    flex: 1,
    border: '1px solid transparent'
  },
  editable: {
    ...fonts.biggest,
    paddingTop: margin,
    paddingBottom: margin,
    height: 31 + margin * 2,
    border: '1px solid transparent',
    outline: 'none'
  },
  highlighter: {
    extend: 'editable',
    whiteSpace: 'pre'
  },
  token: {
    background: 'linear-gradient(0deg, #b8e7aa, #c3ebb7)'
  }
}