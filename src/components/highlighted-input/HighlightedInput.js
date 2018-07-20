import PropTypes from 'prop-types'
import React, { Component } from 'react'
import noop from 'lodash/utility/noop'
import escape from 'lodash/string/escape'
import pick from 'lodash/object/pick'
import keyname from 'keyname'
import injectSheet from 'grape-web/lib/jss'

import AccentMode from '../accent-mode/AccentMode'
import {
  getTouchedWord,
  getTokenPositionNearCaret,
  splitByTokens,
  ensureSpace,
  setCaretPosition,
  scrollLeftToCaret,
  getCaretAt,
} from './utils'
import style from './style'

class HighlightedInput extends Component {
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
    tokens: PropTypes.arrayOf(PropTypes.string),
    caretPosition: PropTypes.oneOf(['start', 'end']),
  }

  static defaultProps = {
    value: '',
    tokens: [],
    focused: true,
    disabled: false,
    theme: {},
    caretPosition: 'end',
    onChange: noop,
    onKeyDown: noop,
    onDidMount: noop,
    onResize: noop,
    getTokenClass: noop,
  }

  constructor(props) {
    super(props)
    const { value } = props
    this.state = {
      value,
      caretAt: getCaretAt(props),
    }
  }

  componentDidMount() {
    this.editable = this.editableRef
    this.ensureContainerSize()
    this.props.onDidMount(this)
  }

  componentWillReceiveProps(nextProps) {
    const { value } = nextProps
    if (value !== this.state.value) {
      this.setState({ value, caretAt: getCaretAt(nextProps) })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.ensureCaretPosition()
    this.ensureContainerSize()
    if (prevState.value !== this.state.value) {
      this.props.onChange(this.state)
    }
  }

  onChangeAccentMode = isAccentMode => {
    this.isAccentMode = isAccentMode
  }

  onChange = ({ target }) => {
    this.setState({
      value: target.value,
      caretAt: target.selectionEnd,
    })
  }

  onKeyDown = e => {
    this.props.onKeyDown(e)
    if (e.defaultPrevented) return

    const key = keyname(e.keyCode)
    let removed = false
    if (key === 'del') removed = this.removeTokenIfTouched('next')
    if (key === 'backspace') removed = this.removeTokenIfTouched('prev')
    if (removed) e.preventDefault()
  }

  /**
   * Scroll highlighter in parallel with editable.
   */
  onScroll = ({ target }) => {
    this.highlighterRef.scrollTop = target.scrollTop
    this.highlighterRef.scrollLeft = target.scrollLeft
  }

  /**
   * Get the word caret is close by.
   */
  getTouchedWord() {
    const { value, caretAt } = this.state
    const word = getTouchedWord(value, caretAt)
    return word ? word.value : ''
  }

  setContainerRef = ref => {
    this.containerRef = ref
  }

  setEditableRef = ref => {
    this.editableRef = ref
  }

  setHighlighterRef = ref => {
    this.highlighterRef = ref
  }

  ensureCaretPosition() {
    if (!this.props.focused || this.isAccentMode) return
    setCaretPosition(this.state.caretAt, this.editable)
  }

  /**
   * Split the value into an array of words and tokens as they appear in text.
   */
  splitByTokens() {
    return splitByTokens(this.state.value, this.props.tokens)
  }

  /**
   * Remove a token completely by one key press.
   * Direction indicates where the word is positioned relatively to the caret.
   *
   * We can improve the speed by using a fake caret in highlighter.
   * We can check if caret is inside/near the token.
   */
  removeTokenIfTouched(direction) {
    const { editable } = this

    const positionToDelete = getTokenPositionNearCaret(
      editable,
      direction,
      this.props.tokens,
    )

    if (!positionToDelete) return false

    // Now we know that caret is inside of a token.
    const [start, end] = positionToDelete
    let { value } = editable
    value = `${value.slice(0, start)}${value.slice(end, value.length)}`
    this.setState({ value, caretAt: start })

    return true
  }

  /**
   * Replace a word near the caret by a string.
   * Ensure space after the string.
   */
  replace(str) {
    let { value, selectionEnd: caretAt } = this.editable

    const word = getTouchedWord(value, caretAt)

    if (!word) return

    const valueBefore = value.slice(0, word.position[0])
    let valueAfter = value.slice(word.position[1], value.length)
    valueAfter = ensureSpace('before', valueAfter)

    value = valueBefore + str + valueAfter
    caretAt = (valueBefore + str).length + 1

    this.setState({ value, caretAt }, () => {
      scrollLeftToCaret(this.editable)
    })
  }

  /**
   * Insert a string at the caret position.
   * Ensure space before the string.
   */
  insert(str) {
    let { value, selectionEnd: caretAt } = this.editable
    let valueBefore = value.slice(0, caretAt)
    valueBefore = ensureSpace('after', valueBefore)

    let valueAfter = value.slice(caretAt, value.length)
    if (valueAfter) valueAfter = ensureSpace('before', valueAfter)
    value = valueBefore + str + valueAfter
    caretAt = (valueBefore + str).length

    this.setState({ value, caretAt }, () => {
      scrollLeftToCaret(this.editable)
    })
  }

  ensureContainerSize() {
    const { containerRef, highlighterRef } = this

    if (
      containerRef &&
      highlighterRef &&
      containerRef.offsetHeight !== highlighterRef.offsetHeight
    ) {
      this.containerRef.style.height = `${highlighterRef.offsetHeight}px`
      this.props.onResize()
    }
  }

  renderHighlighterContent() {
    const { classes } = this.props.sheet
    const { tokens, getTokenClass, theme } = this.props
    const { value } = this.state

    const content = splitByTokens(value, tokens).map((part, index) => {
      const isToken = tokens.indexOf(part) >= 0
      if (isToken) {
        // Render the highlighted token.
        return (
          <span
            key={index} // eslint-disable-line react/no-array-index-key
            className={`${classes.token} ${theme.token} ${getTokenClass(part) ||
              ''}`}
          >
            {part}
          </span>
        )
      }

      // Render pure text without highlighing
      // Used dangerouslySetInnerHTML to workaround a bug in IE11:
      // https://github.com/ubergrape/chatgrape/issues/3279
      return (
        <span
          key={index} // eslint-disable-line react/no-array-index-key
          dangerouslySetInnerHTML={{ __html: escape(part) }} // eslint-disable-line react/no-danger
        />
      )
    })

    // Make highlighted height equal content height in editable,
    // because the last item is a space.
    content.push(' ')

    return content
  }

  render() {
    const {
      Editable,
      theme,
      sheet: { classes },
    } = this.props

    const editableProps = pick(
      this.props,
      'onSubmit',
      'onChange',
      'onFocus',
      'onBlur',
      'onKeyPress',
      'placeholder',
      'disabled',
    )

    return (
      <div
        ref={this.setContainerRef}
        className={`${classes.container} ${theme.container}`}
        data-test="highlighted-editable"
      >
        <div
          ref={this.setHighlighterRef}
          className={`${classes.highlighter} ${theme.highlighter}`}
        >
          {this.renderHighlighterContent()}
        </div>
        <AccentMode
          onChange={this.onChangeAccentMode}
          ref={this.setEditableRef}
        >
          <Editable
            {...editableProps}
            autoFocus
            data-test="editable"
            onKeyDown={this.onKeyDown}
            onChange={this.onChange}
            onScroll={this.onScroll}
            value={this.state.value}
            className={`${classes.editable} ${theme.editable}`}
          />
        </AccentMode>
      </div>
    )
  }
}

export default injectSheet(style)(HighlightedInput)
