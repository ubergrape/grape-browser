import find from 'lodash/collection/find'
import isEmpty from 'lodash/lang/isEmpty'
import {openUrl} from 'grape-web/lib/x-platform'

import {
  getSections,
  findIndexBySelector
} from './data'
import * as types from '../../constants/actionTypes'
import {searchBrowserSelector} from '../../selectors'
import {
  getFocusedItem,
  setFocusedItem,
  extractItems
} from '../../components/browser/dataUtils'
import {SERVICES_TRIGGER} from '../../components/query/constants'

function createState(nextProps) {
  const {data} = nextProps

  if (!data) {
    return {
      ...nextProps,
      sections: [],
      focusedItem: undefined
    }
  }

  const sections = getSections(data)
  const focusedItem = getFocusedItem(sections)

  return {
    ...nextProps,
    sections,
    focusedItem
  }
}

/**
 * Returns a new state with focused item according selector.
 */
function focusItem(selector, state) {
  const {sections} = state
  let id = selector

  if (selector === 'next' || selector === 'prev') {
    const items = extractItems(sections)
    const itemIndex = findIndexBySelector(selector, items, item => item.focused)
    id = items[itemIndex].id
  }

  setFocusedItem(sections, id)

  return {
    sections,
    focusedItem: getFocusedItem(sections)
  }
}

function execAction(state) {
  const action = state.focusedAction
  const item = state.focusedItem

  if (action.type === 'insert') {
    state.onSelectItem({item})
    // FIXME use clearSearchBrowserInput
    return {
      filters: [],
      value: ''
    }
  }

  if (action.type === 'open') {
    const res = find(state.data.results, ({id}) => id === item.id)
    openUrl(res.url)
  }

  return state
}

function focusAction(selector, state) {
  const {actions} = state
  const newIndex = findIndexBySelector(selector, actions, action => action === state.focusedAction)
  return {focusedAction: actions[newIndex]}
}

function focusService(selector, state) {
  const {services} = state
  const newIndex = findIndexBySelector(selector, services, service => service === state.focusedService)
  return {focusedService: services[newIndex]}
}

function navigate(action, state) {
  if (!state.data.results.length) return state

  switch (action) {
    case 'select':
      if (state.focusedList === 'actions') return execAction(state)
      return {focusedList: 'actions'}
    case 'back':
      if (state.focusedList === 'objects') return state
      return {focusedList: 'objects'}
    case 'prev':
    case 'next':
      if (state.focusedList === 'objects') return focusItem(action, state)
      if (state.focusedList === 'actions') return focusAction(action, state)
      if (state.focusedList === 'services') return focusService(action, state)
      break
    default:
  }
}

export function createSearchBrowserState(props) {
  return {
    type: types.CREATE_SEARCH_BROWSER_STATE,
    payload: createState(props)
  }
}

export function resetSearchBrowserState() {
  return {
    type: types.RESET_SEARCH_BROWSER_STATE
  }
}

export function focusSearchBrowserItem(selector) {
  return (dispatch, getState) => {
    const state = searchBrowserSelector(getState())

    dispatch({
      type: types.FOCUS_SEARCH_BROWSER_ITEM,
      payload: focusItem(selector, state)
    })
  }
}

export function focusSearchBrowserAction(action) {
  return {
    type: types.FOCUS_SEARCH_BROWSER_ACTION,
    payload: action
  }
}

export function blurSearchBrowserAction() {
  return {
    type: types.BLUR_SEARCH_BROWSER_ACTION
  }
}

export function execSearchBrowserAction() {
  return (dispatch, getState) => {
    const state = searchBrowserSelector(getState())
    dispatch({
      type: types.EXEC_SEARCH_BROWSER_ACTION,
      payload: execAction(state)
    })
  }
}

export function selectSearchBrowserItem() {
  return (dispatch, getState) => {
    const {focusedItem} = searchBrowserSelector(getState())

    dispatch({
      type: types.SELECT_SEARCH_BROWSER_ITEM,
      payload: focusedItem
    })
  }
}

export function navigateSearchBrowser(action) {
  return (dispatch, getState) => {
    const state = searchBrowserSelector(getState())

    dispatch({
      type: types.NAVIGATE_SEARCH_BROWSER,
      payload: navigate(action, state)
    })
  }
}

export function showSearchBrowserObjects() {
  return {
    type: types.SHOW_SEARCH_BROWSER_OBJECTS
  }
}

export function changeSearchBrowserInput({value, search, filters, query}) {
  return (dispatch, getState) => {
    const {data, onChange} = searchBrowserSelector(getState())

    dispatch({
      type: types.UPDATE_SEARCH_BROWSER_INPUT,
      payload: {value, search, filters}
    })

    if (query.trigger === SERVICES_TRIGGER) {
      const services = data && data.services

      // TODO Should be a separate action for loading services.
      if (isEmpty(services)) {
        dispatch({type: types.LOAD_SEARCH_BROWSER_SERVICES})
        onChange({trigger: query.trigger})
      }
      dispatch({type: types.SHOW_SEARCH_BROWSER_SERVICES})
    } else {
      dispatch(showSearchBrowserObjects())
      onChange({search, filters})
    }
  }
}

export function clearSearchBrowserInput() {
  return {
    type: types.CLEAR_SEARCH_BROWSER_INPUT
  }
}

export function focusSearchBrowserService(item) {
  return {
    type: types.FOCUS_SEARCH_BROWSER_SERVICE,
    payload: item
  }
}

export function addSearchBrowserFilter(service) {
  return dispatch => {
    dispatch(showSearchBrowserObjects())
    dispatch({
      type: types.ADD_SEARCH_BROWSER_FILTER,
      payload: service
    })
  }
}
