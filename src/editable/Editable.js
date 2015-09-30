import React, {Component} from 'react'
import {useSheet} from '../jss'
import {shouldPureComponentUpdate} from 'react-pure-render'
import Scribe from 'scribe-editor'
import scribePluginFormatterPlainTextConvertNewLinesToHtml from 'scribe-plugin-formatter-plain-text-convert-new-lines-to-html'
import debounce from 'lodash/function/debounce'
import escape from 'lodash/string/escape'
import noop from 'lodash/utility/noop'
import keyname from 'keyname'

import * as emoji from '../emoji'
import style from './style'
import * as utils from './utils'
import * as markdown from './markdown'
import Caret from './Caret'
import AccentMode from './AccentMode'
import {REGEX as QUERY_REGEX} from '../query/constants'
import parseQuery from '../query/parse'

@useSheet(style)
export default class Editable extends Component {
  static defaultProps = {
    placeholder: '',
    focused: false,
    disabled: false,
    onAbort: noop,
    onEditPrevious: noop,
    onSubmit: noop,
    onChange: noop,
    onBlur: noop,
    onDidMount: noop,
    onResize: noop
  }

  constructor(props) {
    super(props)
    this.state = this.createState(this.props)
    this.onKeyDownDebounced = debounce(::this.onKeyDownDebounced, 20)
    this.onResizeWindowDebounced = debounce(::this.checkSize, 500)
    this.onPaste = ::this.onPaste
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  componentWillReceiveProps(nextProps) {
    this.setState(this.createState(nextProps))
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.focused && !prevState.focused) {
      this.focus()
    }
  }

  componentDidMount() {
    this.node = React.findDOMNode(this)
    this.node.addEventListener('paste', this.onPaste)
    window.addEventListener('resize', this.onResizeWindowDebounced)

    // Todo add desroy method to scribe so that we can recreate everything on
    // mount. Right now this
    if (!this.scribe) {
      this.scribe = new Scribe(this.node)
      this.scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml())
      this.caret = new Caret(this.scribe)
      this.accentMode = new AccentMode(this.node)
    }

    this.checkSize({silent: true})

    let {onDidMount} = this.props
    if (onDidMount) onDidMount(this)
  }

  componentWillUnmount() {
    this.node.removeEventListener('paste', this.onPaste)
    window.removeEventListener('resize', this.onResizeWindowDebounced)
  }

  createState({focused}) {
    return {focused}
  }

  render() {
    let {classes} = this.props.sheet
    let {placeholder, disabled} = this.props
    let className = classes.editable

    if (utils.isEmpty(this.node) && !this.state.focused) {
      className += ' ' + classes.placeholder
    }

    return (
      <div
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        onInput={::this.onInput}
        onKeyPress={::this.onKeyPress}
        onKeyDown={::this.onKeyDown}
        onMouseDown={::this.onMouseDown}
        className={className}
        // CSS will take it from here.
        data-placeholder={placeholder}
        contentEditable={!disabled}
        data-test="editable"></div>
    )
  }

  /**
   * Replace query.
   */
  replaceQuery(replacement, options = {}) {
    this.caret.selectMarkers()
    let query = this.getQuery()
    if (!query) return false

    return this.modifyAtCaret((left, right) => {
      let newLeft = utils.replaceLastQuery(replacement, query.query, left)
      return [newLeft, right]
    }, {...options, silent: true})
  }

  /**
   * Modify text at caret position.
   * Passed function will receive an array with text before and after the caret.
   */
  modifyAtCaret(modifier, options = {}) {
    let selection = this.caret.createSelection(true)
    let caretsParent = this.caret.getParent(selection)

    if (!caretsParent) return false

    this.caret.placeMarker(selection)

    this.modify(caretsParent, modifier, options, () => {
      selection.selectMarkers(options.keepMarkers)
      if (options.keepMarkers) {
        let markers = this.caret.getMarkers({selection})
        Caret.renameMarkers(markers, 'grape')
      }
    })

    return true
  }

  modify(el, modifier, options, callback) {
    let html = utils.htmlWhitespacesToText(el.innerHTML)
    let parts = html.split(Caret.MARKER_HTML)
    parts = modifier(...parts)
    let newHtml = parts.join(Caret.MARKER_HTML)
    this.scribe.transactionManager.run(() => {
      el.innerHTML = newHtml
      this.afterInsertionAnimation()
      this.checkSize()
      callback()
      if (!options.silent) this.props.onChange(options)
    })
  }

  /**
   * Set focus.
   */
  focus() {
    if (!this.caret.focus()) return
    this.caret.selectMarkers()
  }

  /**
   * Get search key and trigger.
   */
  getQuery() {
    let selection = this.caret.createSelection(true)
    let caretsParent = this.caret.getParent(selection)

    if (!caretsParent || utils.isGrapeObject(caretsParent)) return undefined

    let text = this.caret.getText('before', selection)

    text = utils.htmlWhitespacesToText(text)
    let matches = text.split(QUERY_REGEX)

    if (matches.length < 3) return undefined

    let key = matches.pop()
    let trigger = matches.pop()

    return parseQuery(trigger + key)
  }

  /**
   * Getter for text content.
   *
   * Serialize content to text, use data-object strings instead of
   * textContent if given.
   */
  getTextContent(options) {
    return utils.getText(this.node, options)
  }

  /**
   * Setter for text content.
   *
   * When content passed - set text content and put caret at the end, otherwise
   * clean up the content.
   */
  setTextContent(text) {
    let html = ''

    if (text) {
      html = escape(text)
      html = markdown.replace(html)
      html = emoji.replace(html)
    }

    // Insert marker to put caret there later.
    html += Caret.MARKER_HTML

    // Safari/Chrome will insert another paragraph if there is no text and no br.
    html += '<br />'

    html = utils.splitTextInParagraphs(html)

    this.scribe.transactionManager.run(() => {
      this.node.innerHTML = html
      this.caret.move()
      this.checkSize()
      this.onChange()
    })
    return text
  }

  /**
   * Handle keydown events.
   */
  handleKeyDown(key, e) {
    let caretsParent = this.caret.getParent()
    let inNonEditable = utils.isGrapeObject(caretsParent)

    switch (key) {
      // Remove the element when user hits backspace.
      case 'backspace':
        if (inNonEditable) {
          e.preventDefault()
          this.scribe.transactionManager.run(() => {
            let parent = caretsParent.parentNode
            if (!parent) return
            parent.removeChild(caretsParent)
            utils.removeEmpty(parent, this.node)
          })
        }
        break
      case 'esc':
        this.onAbort('esc')
        e.preventDefault()
        break
      case 'up':
        if (utils.isEmpty(this.node)) {
          this.props.onEditPrevious()
          e.preventDefault()
        }
        break
      // We try to jump over non-editable elements.
      case 'down':
        break
      case 'right':
        if (inNonEditable) this.caret.move('after', caretsParent)
        break
      case 'left':
        if (inNonEditable) this.caret.move('before', caretsParent)
        break
      default:
        // Anything typed within non editable will be triggered after we move
        // the caret before/after that element.
        if (inNonEditable) {
          // We detect if caret is closer to the end of the element or beginning.
          if (this.caret.getText('before').length > this.caret.getText('after').length) {
            this.caret.move('after', caretsParent)
          }
          else this.caret.move('before', caretsParent)
        }
    }
  }

  /**
   * Trigger submit event when user hits enter.
   * Do nothing when alt, ctrl, shift or cmd used.
   */
  submit(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    if (keyname(e.keyCode) !== 'enter') return

    e.preventDefault()
    if (utils.isEmpty(this.node)) return

    let content = this.getTextContent()
    let objects = utils.getResultsFromGrapeObjects(this.node)
    let objectsOnly = !this.getTextContent({skipObjects: true}).trim().length
    this.props.onSubmit({content, objects, objectsOnly})
  }

  /**
   * Remove animate class from grape objects so that they don't get animated
   * again when reinserted into dom.
   */
  afterInsertionAnimation() {
    // Wait until animation is done.
    setTimeout(() => {
      utils.findGrapeObjects(this.node).forEach(el => {
        el.classList.remove('animate')
      })
    }, this.props.insertAnimationDuration)
  }

  /**
   * Ensure always to use paragraphs for new line.
   * Browser inserts br's when user hits shift + enter by default.
   * Otherwise we have an issue when parsing grape query #1862.
   */
  ensureNewLine(key, e) {
    if (key !== 'enter' || !e.shiftKey) return

    e.preventDefault()

    this.scribe.transactionManager.run(() => {
      let selection = this.caret.createSelection(true)
      this.caret.placeMarker(selection)
      let caretsParent = this.caret.getParent(selection)

      let lines = caretsParent.innerHTML.split(Caret.MARKER_HTML)

      let p
      let fragment = document.createDocumentFragment()
      lines.forEach(line => {
        p = document.createElement('p')
        p.innerHTML = line
        // Ensure always to have a br at the end.
        if (!p.lastChild || p.lastChild.nodeName !== 'BR') {
          p.appendChild(document.createElement('br'))
        }
        fragment.appendChild(p)
      })
      caretsParent.parentNode.replaceChild(fragment, caretsParent)
      p.innerHTML = Caret.MARKER_HTML + p.innerHTML
      selection.selectMarkers()
    })
  }

  checkSize(options = {}) {
    let width = this.node.offsetWidth
    let height = this.node.offsetHeight
    let resized = false
    if (this.width !== width) {
      resized = true
      this.width = width
    }
    if (this.height !== height) {
      resized = true
      this.height = height
    }
    if (resized && !options.silent) this.props.onResize()
  }

  onKeyDown(e) {
    let key = keyname(e.keyCode)
    let {nativeEvent} = e
    this.ensureNewLine(key, nativeEvent)
    this.onKeyDownDebounced(key, nativeEvent)
    this.checkSize()
  }

  onKeyDownDebounced(...args) {
    // Only handle key down when editable is still focused.
    // As this function is called with a  delay, focus might have changed
    // already for a good reason.
    if (this.state.focused) this.handleKeyDown(...args)
  }

  onInput() {
    this.checkSize()
    // During this mode we shouldn't place markers as they will end accent mode.
    if (!this.accentMode.active) this.onChange()
  }

  onKeyPress(e) {
    this.submit(e.nativeEvent)
    this.checkSize()
  }

  onMouseDown(e) {
    if (!this.state.focused) this.props.onFocus()
    if (utils.isGrapeObject(e.target)) {
      e.preventDefault()
      this.caret.move('after', e.target)
    }
    this.checkSize()
  }

  onPaste(e) {
    if (!e.clipboardData) return
    let text = e.clipboardData.getData('text/plain')
    if (!text) return
    e.preventDefault()
    // Prevent scribe's "paste" handler from execution.
    e.stopImmediatePropagation()
    let html = utils.textToHtml(text)
    this.scribe.insertHTML(html)
    this.checkSize()
  }

  onAbort(reason) {
    let query = this.getQuery()
    this.props.onAbort({reason, query})
  }

  onChange() {
    this.props.onChange({query: this.getQuery()})
  }
}
