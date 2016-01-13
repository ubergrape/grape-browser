const types = [
  'NOOP',
  'FOCUS_SEARCH_BROWSER_ITEM',
  'CREATE_SEARCH_BROWSER_STATE',
  'SELECT_SEARCH_BROWSER_ITEM',
  'SET_SEARCH_BROWSER_FILTERS'
]

export default types.reduce((map, type) => {
  map[type] = type
  return map
}, {})
