import find from 'lodash-es/collection/find'

/**
 * Get all items from all sections.
 */
export function extractItems(sections) {
  let items = []
  sections.forEach(section => items = items.concat(section.items))
  return items
}

function getItem(sections, fn) {
  let item

  sections.some(section => {
    item = find(section.items, fn)
    return Boolean(item)
  })

  return item
}

/**
 * Get item by id.
 */
function getItemById(sections, id) {
  return getItem(sections, item => {
    return item.id == id
  })
}

/**
 * Get currently focused item.
 */
export function getFocusedItem(sections) {
  return getItem(sections, item => item.focused)
}

/**
 * Mark a item as focused. Unmark previously focused one.
 */
export function setFocusedItem(sections, id) {
  unsetFocusedItem(sections)
  let item = getItemById(sections, id)
  item.focused = true
}


/**
 * Mark currently focused item as not focused.
 */
export function unsetFocusedItem(sections) {
  sections.forEach(section => {
    section.items.forEach(item => item.focused = false)
  })
}

/**
 * Mark a tab at specified index as selected, unmark previously selected one.
 */
export function setSelectedTab(tabs, index) {
  tabs.forEach(tab => tab.selected = false)
  tabs[index].selected = true
}