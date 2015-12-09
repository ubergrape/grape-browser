import React, {PropTypes, Component} from 'react'

import {
  getTokenUnderCaret,
  getQuery,
  getTextAndObjects,
  getObjectsPositions,
  parseAndReplace,
  isFocused
} from './utils'

import keyname from 'keyname'
import {create} from '../objects'

import {useSheet} from 'grape-web/lib/jss'
import style from './style'

@useSheet(style)
export default class HighlightedTextarea extends Component {
  static propTypes = {
    onDidMount: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
    onEditPrevious: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onResize: PropTypes.func.isRequired,
    sheet: PropTypes.object.isRequired,
    focused: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string
  }

  static defaultProps = {
    content: '',
    placeholder: '',
    focused: true,
    disabled: false
  }

  constructor(props) {
    super(props)
    this.state = {
      text: '',
      caretPos: 0,
      objects: {},
      textWithObjects: [],
      objectsPositions: {}
    }
  }

  componentDidMount() {
    const {onDidMount} = this.props
    if (onDidMount) onDidMount(this)
    this.bindedOnWindowResize = ::this.onWindowResize
    window.addEventListener('resize', this.bindedOnWindowResize)
  }

  componentDidUpdate() {
    const {textarea} = this.refs
    if (this.props.focused) textarea.focus()
    if (isFocused(textarea)) textarea.selectionEnd = this.state.caretPos

    this.refs.wrapper.style.height = this.refs.highlighter.offsetHeight + 'px'
    this.onResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.bindedOnWindowResize)
  }

  onWindowResize() {
    if (this.state.text.trim()) this.forceUpdate()
  }

  onChange(e) {
    const {value, selectionEnd} = e.target
    this.setState({
      text: value,
      textWithObjects: getTextAndObjects(this.state.objects, value),
      caretPos: selectionEnd,
      objectsPositions: getObjectsPositions(this.state.objects, value)
    })
    this.props.onChange(getQuery(value, selectionEnd))
  }

  onAbort(reason) {
    const {value, selectionEnd} = this.refs.textarea
    const query = getQuery(value, selectionEnd)
    this.props.onAbort({reason, query})
  }

  onKeyDown(e) {
    const key = keyname(e.keyCode)
    switch (key) {
      case 'esc':
        this.onAbort(key)
        e.preventDefault()
        break
      case 'up':
        if (!this.refs.textarea.value) {
          this.props.onEditPrevious()
          e.preventDefault()
        }
        break
      case 'backspace':
      case 'del':
        this.onDelete(e, key)
        break
      default:
    }
  }

  onKeyPress(e) {
    this.submit(e.nativeEvent)
  }

  // TODO: possibly improve speed with fake caret in highlighter
  // so you can check if caret is inside/near the grape object
  onDelete(e, key) {
    const {text, objectsPositions} = this.state
    const {selectionStart, selectionEnd} = this.refs.textarea

    let positionsToDelete

    Object.keys(objectsPositions).some(object => {
      objectsPositions[object].some(positions => {
        // Check if carret inside object
        if (
          positions[0] <= selectionStart &&
          positions[1] >= selectionEnd
        ) {
          // If selectionStart or selectionEnd
          // not inside object —> do nothing
          if (
            key === 'del' && positions[1] === selectionEnd ||
            key === 'backspace' && positions[0] === selectionStart
          ) {
            return false
          }
          positionsToDelete = positions
          return true
        }
      })
      if (positionsToDelete) return true
    })

    // Now we know that caret is inside object
    if (positionsToDelete) {
      e.preventDefault()

      const [start, end] = positionsToDelete
      const newText = `${text.slice(0, start)}${text.slice(end, text.length)}`

      this.setState({
        text: newText,
        textWithObjects: getTextAndObjects(this.state.objects, newText),
        objectsPositions: getObjectsPositions(this.state.objects, newText),
        caretPos: start
      })
    }
  }

  onResize() {
    this.props.onResize()
  }

  /**
   * Setter for text content.
   *
   * When content passed - set text content and put caret at the end, otherwise
   * clean up the content.
   */
  setTextContent(content, options = {}) {
    if (!this.props.focused) return false

    const {configs, text} = parseAndReplace(content)

    const objects = {}
    configs.forEach(config => {
      const object = create(config.type, config)
      objects[object.content] = object
    })

    this.setState({
      text,
      objects,
      textWithObjects: getTextAndObjects(objects, text),
      caretPos: text.length,
      objectsPositions: getObjectsPositions(objects, text)
    })

    if (!options.silent) this.props.onChange(getQuery(text, text.length))

    return true
  }

  getTextWithMarkdown() {
    return this.state.textWithObjects
      .map(item => item.str ? item.str : item)
      .join('')
  }

  addContent(str) {
    this.refs.textarea.value += str
    this.onChange({target: this.refs.textarea})
  }

  /**
   * Replace text string to token in state
   */
  replaceQuery(replacement) {
    const {textarea} = this.refs
    const {selectionEnd} = textarea

    let {text} = this.state
    const token = getTokenUnderCaret(textarea.value, selectionEnd)
    const textBefore = text.slice(0, token.position[0])
    const textAfter = text.slice(token.position[1], text.length)

    text = `${textBefore}${replacement.content}${textAfter} `
    const objects = {
      ...this.state.objects,
      [replacement.content]: replacement
    }
    const caretPos = selectionEnd + replacement.content.length

    this.setState({
      text,
      objects,
      caretPos,
      textWithObjects: getTextAndObjects(objects, text),
      objectsPositions: getObjectsPositions(objects, text)
    })
  }

  /**
   * Trigger submit event when user hits enter.
   * Do nothing when alt, ctrl, shift or cmd used.
   */
  submit(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    if (keyname(e.keyCode) !== 'enter') return

    if (!this.state.text.trim()) return
    e.preventDefault()

    const content = this.getTextWithMarkdown()
    const {textWithObjects} = this.state
    const objects = textWithObjects.reduce((onlyObjects, item) => {
      if (typeof item === 'object') {
        onlyObjects.push(item.result || item)
      }
      return onlyObjects
    }, [])

    const objectsOnly = !textWithObjects
      .filter(item => typeof item === 'string' && item.trim().length)
      .length

    this.props.onSubmit({content, objects, objectsOnly})
  }

  renderTokens() {
    const content = this.state.textWithObjects.map((item, index) => {
      if (item.content) return this.renderToken(item, index)
      return <span key={index}>{item}</span>
    })

    // The last item is space,
    // to make highlight height equal
    // to content in textarea
    content.push(' ')
    return content
  }

  renderToken(object, index) {
    const {token, user, room, search, emoji} = this.props.sheet.classes

    let tokenType
    switch (object.tokenType) {
      case 'user':
        tokenType = user
        break
      case 'room':
        tokenType = room
        break
      case 'search':
        tokenType = search
        break
      case 'emoji':
        tokenType = emoji
        break
      default:
        tokenType = ''
    }

    return (
      <span
        key={index}
        className={`${token} ${tokenType}`}>
          {object.content}
      </span>
    )
  }

  renderHighlighter() {
    const {common, highlighter} = this.props.sheet.classes
    return (
      <div
        ref="highlighter"
        className={`${highlighter} ${common}`}>
          {this.renderTokens()}
      </div>
    )
  }

  render() {
    const {common, wrapper, textarea} = this.props.sheet.classes

    return (
      <div
        ref="wrapper"
        className={wrapper}
        data-test="highlighted-textarea">
          {this.renderHighlighter()}
          <textarea
            ref="textarea"
            className={`${textarea} ${common}`}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            onKeyDown={::this.onKeyDown}
            onKeyPress={::this.onKeyPress}
            onChange={::this.onChange}
            value={this.state.text}
            autoFocus></textarea>
      </div>
    )
  }
}
