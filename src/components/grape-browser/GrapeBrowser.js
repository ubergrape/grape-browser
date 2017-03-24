import React, {PropTypes, Component} from 'react'
import injectSheet from 'grape-web/lib/jss'
import isEmpty from 'lodash/lang/isEmpty'
import find from 'lodash/collection/find'
import findIndex from 'lodash/array/findIndex'
import get from 'lodash/object/get'
import pick from 'lodash/object/pick'
import keyname from 'keyname'
import {shallowEqual} from 'react-pure-render'

import SearchBrowser from '../search-browser/SearchBrowserModalProvider'
import EmojiBrowser from '../emoji-browser/Browser'
import GrapeInput from '../grape-input/GrapeInput'
import Datalist from '../datalist/Datalist'
import * as mentions from '../mentions/mentions'
import {TYPES as QUERY_TYPES} from '../query/constants'
import QueryModel from '../query/Model'
import * as emoji from '../emoji'
import * as emojiSuggest from '../emoji-suggest'
import style from './style'
import * as utils from './utils'

const publicMethods = ['setTextContent', 'getTextContent']

// Map indicates whether browser has its own input field or
// its using the main one.
const browserWithInput = {
  search: true,
  emoji: true,
  emojiSuggest: false,
  user: false
}

/**
 * Uses all types of auto completes to provide end component.
 */
@injectSheet(style)
export default class GrapeBrowser extends Component {
  static propTypes = {
    container: PropTypes.object,
    isLoading: PropTypes.bool,
    placeholder: PropTypes.string,
    setTrigger: PropTypes.bool,
    disabled: PropTypes.bool,
    focused: PropTypes.bool,
    sheet: PropTypes.object.isRequired,
    customEmojis: PropTypes.object,
    images: PropTypes.object,
    browser: PropTypes.oneOf(Object.keys(browserWithInput)),
    externalServicesInputDelay: PropTypes.number,
    services: PropTypes.array,

    onDidMount: PropTypes.func,
    onEditPrevious: PropTypes.func,
    onSubmit: PropTypes.func,
    onAbort: PropTypes.func,
    onAddIntegration: PropTypes.func,
    onInsertItem: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onComplete: PropTypes.func,
    onChange: PropTypes.func,
    onResize: PropTypes.func,
    onLoadServices: PropTypes.func,
    onLoadServicesResultsAmounts: PropTypes.func
  }

  static defaultProps = {
    // This attribute has been set by Modal component.
    // We need to set it to null to enable shallowEqual comparance in
    // componentWillReceiveProps, because this is the only new prop.
    ariaHidden: null,
    maxSuggestions: 12,
    externalServicesInputDelay: 150,
    browser: undefined,
    data: undefined,
    images: {},
    contentObjects: [],
    services: [],
    customEmojis: undefined,
    placeholder: undefined,
    focused: false,
    disabled: false,
    setTrigger: false,
    isLoading: false,
    onAbort: undefined,
    onEditPrevious: undefined,
    onSubmit: undefined
  }

  constructor(props) {
    super(props)
    this.query = new QueryModel({onChange: this.onChangeQuery})
    this.exposePublicMethods()
    this.state = this.createState(props)
  }

  componentDidMount() {
    this.setTrigger(this.state.browser)
    if (this.props.onDidMount) this.props.onDidMount(this)
  }

  componentWillReceiveProps(nextProps) {
    // We need to do early return here because for "some reason?" this method
    // is called when inserting items from the search-browser. While
    // search-browser is closed, props still define it as open, which leads to
    // reopening of the search-browser by setState call below.
    // To avoid this we introduced temporarily shallowEqual, hopefully it can
    // go away after full migration to redux.
    if (shallowEqual(nextProps, this.props)) return

    const newEmojiSheet = get(nextProps, 'images.emojiSheet')
    const currEmojiSheet = get(this.props, 'images.emojiSheet')
    if (newEmojiSheet !== currEmojiSheet) {
      EmojiBrowser.init({
        emojiSheet: newEmojiSheet,
        customEmojis: nextProps.customEmojis
      })
    }
    this.setState(this.createState(nextProps))
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.browser !== this.state.browser && nextProps.setTrigger) {
      this.setTrigger(nextState.browser)
    }
  }

  onEditPrevious = () => {
    if (this.props.onEditPrevious) this.props.onEditPrevious()
  }

  onSubmit = (data) => {
    clearTimeout(this.searchBrowserInputTimeoutId)
    this.query.reset()
    if (this.props.onSubmit) this.props.onSubmit(data)
  }

  onAbort = (data = {}) => {
    const {browser} = this.state
    this.closeBrowser({inputFocused: true}, () => {
      if (this.props.onAbort) this.props.onAbort({...data, browser})
    })
  }

  onSelectSearchBrowserItem = ({item, query}) => {
    clearTimeout(this.searchBrowserInputTimeoutId)
    this.insertItem(item, query)
  }

  onSelectEmojiBrowserItem = ({item, query}) => {
    this.insertItem(item, query)
  }

  onSelectDatalistItem = (item) => {
    this.insertItem(item, this.query.toJSON())
  }

  onAddSearchBrowserIntegration = () => {
    this.closeBrowser(null, () => {
      if (this.props.onAddIntegration) this.props.onAddIntegration()
    })
  }

  onInsertItem = (item, query) => {
    const {type} = item
    let {service} = item
    let rank = 0

    const results = get(this.state, 'data.results')
    if (!isEmpty(results)) {
      const index = findIndex(results, res => res.id === item.id)
      rank = index + 1
      service = results[index].service
    }

    clearTimeout(this.searchBrowserInputTimeoutId)
    if (this.props.onInsertItem) this.props.onInsertItem({query, type, service, rank})
  }

  onDidMountBrowser = (ref) => {
    this.browser = ref
  }

  onDidMountDatalist = (ref) => {
    this.datalist = ref
  }

  onDidMountEditable = (ref) => {
    this.editable = ref
  }

  onKeyDown = (e) => {
    if (browserWithInput[this.state.browser] === false) {
      this.navigateDatalist(e)
    }
  }

  onBlurInput = () => {
    // Delay blur event for the case when an external button was clicked,
    // because we are going to regain focus in a bit.
    setTimeout(() => {
      const {browser} = this.state
      if (!browser || browserWithInput[browser] === false) {
        if (this.props.onBlur) this.props.onBlur()
      }
    }, 100)
  }

  onFocusInput = () => {
    if (this.props.onFocus) this.props.onFocus()
  }

  onEmojiBrowserOutsideClick = () => {
    this.closeBrowser(null, () => {
      const {browser} = this.state
      if (this.props.onAbort) this.props.onAbort({reason: 'esc', browser})
    })
  }

  onChangeSearchBrowser = (data) => {
    const complete = () => {
      if (this.props.onComplete) {
        this.props.onComplete({...data, trigger: this.query.get('trigger')})
      }
      if (this.props.onChange) this.props.onChange()
    }

    if (!utils.isExternalSearch(this.state.data)) return complete()

    clearTimeout(this.searchBrowserInputTimeoutId)
    this.searchBrowserInputTimeoutId = setTimeout(
      complete,
      this.props.externalServicesInputDelay
    )
  }

  onInputResize = () => {
    if (this.props.onResize) this.props.onResize()
  }

  onLoadServices = () => {
    if (this.props.onLoadServices) this.props.onLoadServices()
  }

  onLoadServicesResultsAmounts = (search, callback) => {
    if (this.props.onLoadServicesResultsAmounts) {
      this.props.onLoadServicesResultsAmounts({search, callback})
    }
  }

  onChangeInput = ({query, content} = {}) => {
    // Handler might be called when content has been just set, so it is changed
    // for the underlying component but not here.
    const contentHasChanged = content !== this.state.content
    const isBrowserOpened = Boolean(this.state.browser)
    const hasTrigger = Boolean(query && query.trigger)

    clearTimeout(this.searchBrowserInputTimeoutId)

    if (hasTrigger && contentHasChanged) {
      this.query.set(query, {silent: true})
      if (this.props.onComplete) this.props.onComplete({...this.query.toJSON(), emoji})
    }

    // Query has been removed or caret position changed, for datalist only.
    if (!hasTrigger && !this.query.isEmpty()) {
      this.query.reset()
      if (isBrowserOpened) this.onAbort({reason: 'deleteTrigger'})
    }

    if (this.props.onChange) {
      if (content === undefined) this.props.onChange()
      else this.setState({content}, () => this.props.onChange())
    } else {
      this.setState({content})
    }
  }

  onChangeQuery = (str) => {
    this.editable.insert(str)
  }

  setTrigger(browser) {
    if (!browser) return

    this.query.set('trigger', QUERY_TYPES[browser])
  }

  getTextContent = () => {
    return this.state.content
  }

  setTextContent = (content, options = {}) => {
    const {caretPosition, silent} = options
    this.query.reset()
    this.setState({content, caretPosition}, () => {
      if (!silent) this.onChangeInput()
    })
  }

  exposePublicMethods() {
    const {container} = this.props
    if (!container) return
    publicMethods.forEach(method => {
      container[method] = this[method]
    })
  }

  createState(nextProps) {
    const state = pick(nextProps, 'browser', 'data', 'isLoading')

    if (state.browser === 'user') {
      state.data = mentions
        .map(state.data)
        .slice(0, nextProps.maxSuggestions)
    }
    if (state.browser === 'emojiSuggest') {
      state.data = emojiSuggest
        .sortByRankAndLength(state.data)
        .slice(0, nextProps.maxSuggestions)
    }
    state.query = this.query.toJSON()

    const canShowBrowser = utils.canShowBrowser(this.state, state)

    if (canShowBrowser) {
      state.browserOpened = true
    } else {
      state.browser = null
      state.browserOpened = false
    }

    if (!this.state) {
      state.content = ''
    }

    state.inputFocused = false
    if (nextProps.focused) {
      state.inputFocused = true

      if (state.browserOpened) {
        state.inputFocused = !browserWithInput[state.browser]
      }
    }

    return state
  }

  closeBrowser(state, callback) {
    this.setState({
      browser: null,
      browserOpened: false,
      ...state
    }, callback)
  }

  /**
   * Keyboard navigation for the datalist (mention, emojiSuggest).
   */
  navigateDatalist(e) {
    const {datalist} = this
    if (!datalist) return

    switch (keyname(e.keyCode)) {
      case 'down':
      case 'tab':
        datalist.focus('next')
        e.preventDefault()
        break
      case 'up':
        datalist.focus('prev')
        e.preventDefault()
        break
      case 'enter':
        this.insertItem(datalist.state.focused)
        e.preventDefault()
        break
      default:
    }
  }

  insertItem(item, query) {
    if (item) {
      const results = get(this.state, 'data.results')
      const result = find(results, res => res.id === item.id) || item
      this.editable.replace(result)
    }
    this.onInsertItem(item, query)
    this.closeBrowser({inputFocused: true})
    this.query.reset()
  }

  renderBrowser() {
    const {browser, browserOpened, data} = this.state

    if (!browser || !browserOpened) return null

    const {
      sheet: {classes},
      images
    } = this.props

    if (browser === 'search') {
      return (
        <SearchBrowser
          className={classes.browser}
          data={data}
          services={this.props.services}
          images={images}
          isExternal={utils.isExternalSearch(data)}
          isLoading={this.props.isLoading}
          onAbort={this.onAbort}
          onSelectItem={this.onSelectSearchBrowserItem}
          onAddIntegration={this.onAddSearchBrowserIntegration}
          onChange={this.onChangeSearchBrowser}
          onLoadServices={this.onLoadServices}
          onLoadResultsAmounts={this.onLoadServicesResultsAmounts}
          onDidMount={this.onDidMountBrowser} />
      )
    }

    if (browser === 'emoji') {
      return (
        <EmojiBrowser
          images={images}
          className={classes.browser}
          customEmojis={this.props.customEmojis}
          onAbort={this.onAbort}
          onSelectItem={this.onSelectEmojiBrowserItem}
          onOutsideClick={this.onEmojiBrowserOutsideClick}
          onDidMount={this.onDidMountBrowser} />
      )
    }

    return (
      <Datalist
        className={classes.browser}
        images={images}
        data={data}
        onSelect={this.onSelectDatalistItem}
        onDidMount={this.onDidMountDatalist} />
    )
  }

  render() {
    const {classes} = this.props.sheet

    return (
      <div
        className={classes.grapeBrowser}
        data-test="grape-browser">
        {this.renderBrowser()}
        <div className={classes.scroll}>
          <GrapeInput
            onKeyDown={this.onKeyDown}
            onAbort={this.onAbort}
            onResize={this.onInputResize}
            onChange={this.onChangeInput}
            onBlur={this.onBlurInput}
            onFocus={this.onFocusInput}
            onSubmit={this.onSubmit}
            onEditPrevious={this.onEditPrevious}
            onDidMount={this.onDidMountEditable}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            focused={this.state.inputFocused}
            content={this.state.content}
            caretPosition={this.state.caretPosition} />
        </div>
      </div>
    )
  }
}
