import React, {Component} from 'react'
import findIndex from 'lodash/array/findIndex'
import pick from 'lodash/object/pick'
import get from 'lodash/object/get'
import assign from 'lodash/object/assign'
import noop from 'lodash/utility/noop'
import keyname from 'keyname'
import {shouldPureComponentUpdate} from 'react-pure-render'

import {useSheet} from '../jss'
import style from './browserStyle'
import TabsWithControls from '../tabs/TabsWithControls'
import Grid from '../grid/Grid'
import Item from './item/Item'
import * as dataUtils from './dataUtils'
import * as emoji from '../emoji'
import Input from '../input/Input'
import Empty from '../empty/Empty'
import GlobalEvent from '../global-event/GlobalEvent'

const PUBLIC_METHODS = ['focusItem', 'getFocusedItem']

/**
 * Main emoji browser component.
 */
class Browser extends Component {
  static defaultProps = {
    customEmojis: undefined,
    images: {},
    height: 400,
    maxWidth: 920,
    className: '',
    focused: undefined,
    onSelectItem: noop,
    onBlur: noop,
    onDidMount: noop,
    onAbort: noop
  }

  constructor(props) {
    super(props)
    this.exposePublicMethods()
    this.state = this.createState(this.props, {})
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  componentWillUpdate(nextProps, nextState) {
    assign(nextState, this.createState(nextProps, nextState))
  }

  componentDidUpdate() {
    this.cacheItemsPerRow()
  }

  componentWillUnmount() {
    this.grid = null
  }

  componentDidMount() {
    this.props.onDidMount(this)
    this.cacheItemsPerRow()
  }

  exposePublicMethods() {
    let {container} = this.props
    if (!container) return
    PUBLIC_METHODS.forEach(method => container[method] = ::this[method])
  }

  createState(nextProps, nextState) {
    let currEmojiSheet = get(this.props, 'images.emojiSheet')
    let newEmojiSheet = get(nextProps, 'images.emojiSheet')
    if (newEmojiSheet && (newEmojiSheet !== currEmojiSheet || !emoji.get())) {
      PublicBrowser.init({
        emojiSheet: newEmojiSheet,
        customEmojis: nextProps.customEmojis
      })
    }

    let {facet, search} = nextState

    if (facet !== 'search') search = null
    let sections = dataUtils.getSections(search, facet)

    let tabs = dataUtils.getTabs({
      orgLogo: nextProps.images.orgLogo,
      selected: facet,
      hasSearch: Boolean(nextState.search)
    })

    return {tabs, facet, sections}
  }

  render() {
    let {classes} = this.props.sheet
    let {sections} = this.state

    return (
      <div
        className={`${classes.browser} ${this.props.className}`}
        style={pick(this.props, 'height', 'maxWidth')}
        onMouseDown={::this.onMouseDown}>
        <GlobalEvent
          event="resize"
          handler={::this.onResize}
          debounce={500} />
        <Input
          onInput={::this.onInput}
          onBlur={this.props.onBlur}
          onKeyDown={::this.onKeyDown}
          focused={this.props.focused}
          type="emoji" />
        <TabsWithControls data={this.state.tabs} onSelect={::this.onSelectTab} />
        {!sections.length && <Empty text="No emoji found." />}
        {sections.length > 0 &&
          <div className={classes.column}>
            <div className={classes.row}>
              <Grid
                data={sections}
                images={this.props.images}
                Item={Item}
                focusedItem={dataUtils.getFocusedItem(sections)}
                className={classes.leftColumn}
                section={{contentClassName: classes.sectionContent}}
                onFocus={::this.onFocusItem}
                onSelect={::this.onSelectItem}
                onDidMount={::this.onGridDidMount} />
            </div>
          </div>
        }
      </div>
    )
  }

  getFocusedItem() {
    return dataUtils.getFocusedItem(this.state.sections)
  }

  cacheItemsPerRow() {
    let {sections} = this.state

    if (!sections.length) return

    let sectionComponent = this.grid.getSectionComponent(sections[0].id)
    let contentComponent = sectionComponent.getContentComponent()
    let {width: gridWidth} = React.findDOMNode(contentComponent).getBoundingClientRect()

    // Speed up if grid width didn't change.
    if (this.itemsPerRow && gridWidth === this.gridWidth) return
    this.gridWidth = gridWidth

    let id = get(this.state, 'sections[0].items[0].id')
    if (!id) return

    let component = this.grid.getItemComponent(id)
    let itemWidth = React.findDOMNode(component).offsetWidth
    this.itemsPerRow = Math.floor(gridWidth / itemWidth)
  }

  /**
   * Select tab.
   *
   * @param {String} id can be item id or "prev" or "next"
   */
  selectTab(selector) {
    let {tabs} = this.state
    let facet = selector
    if (typeof selector == 'string') {
      let currIndex = findIndex(tabs, tab => tab.selected)
      if (selector === 'next') {
        if (tabs[currIndex + 1]) facet = tabs[currIndex + 1].id
        else facet = tabs[0].id
      }
      else {
        if (tabs[currIndex - 1]) facet = tabs[currIndex - 1].id
        else facet = tabs[tabs.length - 1].id
      }
    }
    let newIndex = findIndex(tabs, tab => tab.id === facet)
    facet = tabs[newIndex].id
    this.setState({facet})
  }

  focusItem(id) {
    let {sections} = this.state
    if (!sections.length) return
    let nextItemId = id
    let nextItem = dataUtils.getItem(sections, nextItemId, this.itemsPerRow)
    if (nextItem) nextItemId = nextItem.id

    let prevItem = dataUtils.getFocusedItem(sections)

    let prevComponent = this.grid.getItemComponent(prevItem.id)
    if (prevComponent) prevComponent.setState({focused: false})

    let nextComponent = this.grid.getItemComponent(nextItemId)
    if (nextComponent) nextComponent.setState({focused: true})

    dataUtils.setFocusedItem(sections, nextItemId)
  }

  selectItem(id) {
    this.focusItem(id)
    this.props.onSelectItem({item: this.getFocusedItem()})
  }

  /**
   * Keyboard navigation.
   */
  navigate(e) {
    let {query} = e.detail
    switch (keyname(e.keyCode)) {
      case 'down':
        this.focusItem('nextRow')
        e.preventDefault()
        break
      case 'up':
        this.focusItem('prevRow')
        e.preventDefault()
        break
      case 'left':
        this.focusItem('prev')
        e.preventDefault()
        break
      case 'right':
        this.focusItem('next')
        e.preventDefault()
        break
      case 'enter':
        this.props.onSelectItem({item: this.getFocusedItem()})
        e.preventDefault()
        break
      case 'tab':
        this.selectTab(e.shiftKey ? 'prev' : 'next')
        e.preventDefault()
        break
      case 'esc':
        this.props.onAbort({
          reason: 'esc',
          query: query
        })
        e.preventDefault()
        break
      case 'backspace':
        if (!query.key) {
          this.props.onAbort({
            reason: 'backspace',
            query
          })
          e.preventDefault()
        }
        break

      default:
    }
  }

  onFocusItem({id}) {
    this.focusItem(id)
  }

  onSelectItem({id}) {
    this.selectItem(id)
  }

  onSelectTab({id}) {
    this.selectTab(id)
  }

  onGridDidMount(grid) {
    this.grid = grid
  }

  onInput({search}) {
    this.setState({
      search: search,
      facet: search ? 'search' : undefined
    })
  }

  onKeyDown(e) {
    this.navigate(e)
  }

  onMouseDown(e) {
    // Avoids loosing focus and though caret position in input.
    e.preventDefault()
  }

  onResize() {
    this.cacheItemsPerRow()
  }
}

let PublicBrowser = useSheet(Browser, style)
PublicBrowser.init = (options) => {
  let {emojiSheet, customEmojis} = options
  if (emojiSheet) emoji.setSheet(emojiSheet)
  if (customEmojis) emoji.defineCustom(customEmojis)
  dataUtils.init()
}

export default PublicBrowser
