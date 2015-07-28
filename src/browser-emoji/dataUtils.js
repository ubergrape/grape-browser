import React from 'react'
import find from 'lodash/collection/find'
import indexBy from 'lodash/collection/indexBy'
import values from 'lodash/object/values'
import compact from 'lodash/array/compact'

import * as dataUtils from '../browser/dataUtils'
import * as grid from './grid'
import EMOJI_META from '../emoji/meta'
import * as emoji from '../emoji'
import Icon from '../emoji/Icon'
import * as itemStyle from './item/style'

const EMOJI_CATEGORY_ORDER = {
  emoticons: 0,
  nature: 1,
  objects: 2,
  places: 3,
  other: 4
}

const EMOJI_CATEGORY_ICON = {
  emoticons: 'smiley',
  nature: 'four_leaf_clover',
  objects: 'soccer',
  places: 'airplane',
  other: '1234',
  customEmoji: 'customEmoji'
}

const EMOJI_META_MAP = indexBy(EMOJI_META, 'name')

let allSections = []

export let {getFocusedItem} = dataUtils
export let {setFocusedItem} = dataUtils
export let {setSelectedTab} = dataUtils
export let {getItem} = grid

export function init() {
  if (!emoji.get()) return

  EMOJI_META.forEach(data => {
    let section = find(allSections, item => item.id === data.cat)

    if (!section) {
      section = {
        id: data.cat,
        label: data.cat,
        itemNames: [],
        items: [],
        selected: false
      }
      allSections.push(section)
    }

    section.itemNames.push(data.name)
  })

  allSections = allSections.sort((section1, section2) => {
    return EMOJI_CATEGORY_ORDER[section1.id] - EMOJI_CATEGORY_ORDER[section2.id]
  })

  // Populate emoji sections with items if we have them in js-emoji.
  allSections.forEach(section => {
    section.items = []
    section.itemNames.forEach(name => {
      let item = emoji.get(name)
      if (item) section.items.push(item)
    })
  })

  allSections.push({
    id: 'customEmoji',
    label: 'Grapemoji',
    selected: false,
    items: values(emoji.getCustom())
  })
}

export function getSections(search) {
  let ret = allSections

  if (search) {
    ret = ret.map(section => {
      let items = section.items.filter(item => {
        if (item.name.indexOf(search) >= 0) return true
        let metaItem = EMOJI_META_MAP[item.name]
        if (!metaItem) return false
        return metaItem.aliases.some(alias => alias.indexOf(search) >= 0)
      })
      if (items.length) return {...section, items}
    })
    ret = compact(ret)
  }

  return ret
}

export function getSection(sections, facet) {
  let section = find(sections, sect => sect.id === facet)
  if (section) setFocusedItem([section], section.items[0].id)
  return section
}

export function getTabs(sections, options) {
  let selected = options.selected || 'emoticons'

  return allSections.map(section => {
    let id = section.id
    let iconId = EMOJI_CATEGORY_ICON[section.id]
    let style

    if (iconId === 'customEmoji') {
      style = {
        backgroundImage: `url(${options.orgLogo})`,
        ...itemStyle.TAB_ICON
      }
    }
    else {
      let smiley = emoji.get(iconId)
      style = {...emoji.getSliceStyle(smiley.id), ...itemStyle.TAB_ICON}
    }

    let icon = <Icon style={style} />
    return {id, selected: selected === section.id, icon}
  })
}
