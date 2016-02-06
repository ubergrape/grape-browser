import React, {PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'
import noop from 'lodash/utility/noop'
import escape from 'lodash/string/escape'
import keyname from 'keyname'
import {useSheet} from 'grape-web/lib/jss'

import {
  getTouchedWord,
  getTokenPositionNearCaret,
  splitByTokens,
  ensureSpace,
  setCaretPosition
} from './utils'
import style from './style'

@useSheet(style)
export default class HighlightedInput extends Component {
  static propTypes = {
    onDidMount: PropTypes.func,
    onChange: PropTypes.func,
    onResize: PropTypes.func,
    onKeyDown: PropTypes.func,
    getTokenClass: PropTypes.func,
    sheet: PropTypes.object.isRequired,
    Editable: PropTypes.func.isRequired,
    focused: PropTypes.bool,
    disabled: PropTypes.bool,
    theme: PropTypes.object,
    value: PropTypes.string,
    tokens: PropTypes.arrayOf(PropTypes.string)
  }

  static defaultProps = {
    value: '',
    tokens: [],
    focused: true,
    disabled: false,
    theme: {},
    onChange: noop,
    onKeyDown: noop,
    onDidMount: noop,
    onResize: noop,
    getTokenClass: noop
  }

  constructor(props) {
    super(props)
    const {value} = props
    this.state = {
      value,
      caretAt: value.length
    }
  }

  componentDidMount() {
    this.ensureContainerSize()
    this.props.onDidMount(this)
  }

  componentWillReceiveProps({value}) {
    if (value !== this.state.value) {
      this.setState({value, caretAt: value.length})
    }
  }

  componentDidUpdate() {
    this.ensureCaretPosition()
    this.ensureContainerSize()
  }

  onChange({target}) {
    this.applyChange({
      value: target.value,
      caretAt: target.selectionEnd
    })
  }

  onKeyDown(e) {
    this.props.onKeyDown(e)
    if (e.defaultPrevented) return

    const key = keyname(e.keyCode)
    let removed = false
    if (key === 'del') removed = this.removeToken('next')
    if (key === 'backspace') removed = this.removeToken('prev')
    if (removed) e.preventDefault()
  }

  /**
   * Get the word caret is close by.
   */
  getTouchedWord() {
    const {value, selectionEnd: caretAt} = ReactDOM.findDOMNode(this.refs.editable)
    const word = getTouchedWord(value, caretAt)
    if (word) return word.value
  }

  /**
   * Insert a string at the caret position.
   * Ensure space before the string.
   */
  insert(str) {
    let {value, selectionEnd: caretAt} = ReactDOM.findDOMNode(this.refs.editable)
    let valueBefore = value.slice(0, caretAt)
    valueBefore = ensureSpace('after', valueBefore)

    const valueAfter = value.slice(caretAt, value.length)
    value = valueBefore + str + valueAfter

    caretAt = (valueBefore + str).length

    this.applyChange({value, caretAt})
  }

  /**
   * Replace a word near the caret by a string.
   * Ensure space after the string.
   */
  replace(str) {
    let {value, selectionEnd: caretAt} = ReactDOM.findDOMNode(this.refs.editable)

    const word = getTouchedWord(value, caretAt)

    if (!word) return

    const valueBefore = value.slice(0, word.position[0])
    let valueAfter = value.slice(word.position[1], value.length)
    if (valueAfter) valueAfter = ensureSpace('before', valueAfter)

    value = valueBefore + str + valueAfter
    caretAt = (valueBefore + str).length

    this.applyChange({value, caretAt})
  }

  /**
   * Remove a token completely by one key press.
   * Direction indicates where the word is positioned relatively to the caret.
   *
   * We can improve the speed by using a fake caret in highlighter.
   * We can check if caret is inside/near the token.
   */
  removeToken(direction) {
    const editable = ReactDOM.findDOMNode(this.refs.editable)

    const positionToDelete = getTokenPositionNearCaret(editable, direction, this.props.tokens)

    if (!positionToDelete) return false

    // Now we know that caret is inside of a token.
    const [start, end] = positionToDelete
    let {value} = editable
    value = `${value.slice(0, start)}${value.slice(end, value.length)}`
    this.applyChange({value, caretAt: start})

    return true
  }

  /**
   * Split the value into an array of words and tokens as they appear in text.
   */
  splitByTokens() {
    return splitByTokens(this.state.value, this.props.tokens)
  }

  ensureCaretPosition() {
    if (!this.props.focused) return
    setCaretPosition(this.state.caretAt, ReactDOM.findDOMNode(this.refs.editable))
  }

  ensureContainerSize() {
    this.refs.container.style.height = this.refs.highlighter.offsetHeight + 'px'

    // TODO Only call back if really resized.
    this.props.onResize()
  }

  applyChange(change) {
    this.setState(change, () => {
      this.props.onChange(change)
    })
  }

  renderHighlighterContent() {
    const {classes} = this.props.sheet
    const {tokens, getTokenClass} = this.props
    const {value} = this.state

    const content = splitByTokens(value, tokens).map((part, index) => {
      const isToken = tokens.indexOf(part) >= 0
      if (isToken) {
        // Render the highlighted token.
        return (
          <span
            key={index}
            className={`${classes.token} ${getTokenClass(part) || ''}`}>
            {part}
          </span>
        )
      }

      // Render pure text without highlighing
      // Used dangerouslySetInnerHTML to workaround a bug in IE11:
      // https://github.com/ubergrape/chatgrape/issues/3279
      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{__html: escape(part)}}>
        </span>
      )
    })

    // Make highlighted height equal content height in editable,
    // because the last item is a space.
    content.push(' ')

    return content
  }

  render() {
    const {classes} = this.props.sheet
    const {Editable, theme} = this.props

    return (
      <div
        ref="container"
        className={classes.container}
        data-test="highlighted-editable">
        <div
          ref="highlighter"
          className={`${classes.highlighter} ${theme.editable}`}>
          {this.renderHighlighterContent()}
        </div>
        <Editable
          {...this.props}
          ref="editable"
          onKeyDown={::this.onKeyDown}
          onChange={::this.onChange}
          value={this.state.value}
          className={theme.editable} />
      </div>
    )
  }
}