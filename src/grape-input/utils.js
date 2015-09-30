import isEmpty from 'lodash/lang/isEmpty'
import get from 'lodash/object/get'
import {EMOJI_TRIGGER, SEARCH_TRIGGER} from '../query/constants'

/**
 * Returns true if search is external.
 */
export function isExternalSearch(data) {
  return get(data, 'search.type') === 'external'
}

/**
 * Returns true if browser can be shown.
 */
export function canShowBrowser(prevState = {}, nextState) {
  let {query, data} = nextState

  if (!nextState.browser) return false

  if (nextState.isLoading) return true

  let isClosed = !prevState.browser
  let isSearch = nextState.browser === 'search'
  let noResults = !data || isEmpty(data.results)
  let hasSearch = query && query.search.length > 0
  let closedBySpace = hasSearch && query.search[query.search.length - 1] === ' '

  if (isClosed && noResults && hasSearch) return false

  if (isSearch && noResults && closedBySpace) return false

  return true
}

/**
 * Returns true if type will be rendered using grape-browser.
 */
export function isBrowserType(typeOrTrigger) {
  return typeOrTrigger === EMOJI_TRIGGER ||
    typeOrTrigger === SEARCH_TRIGGER ||
    typeOrTrigger === 'search' ||
    typeOrTrigger === 'emoji'
}
