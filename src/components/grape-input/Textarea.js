import React, {PropTypes, Component} from 'react'
import keyname from 'keyname'
import noop from 'lodash/utility/noop'

export default class Textarea extends Component {
  static propTypes = {
    onKeyDown: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onAccent: PropTypes.func,
    accentMode: PropTypes.object,
    className: PropTypes.string
  }

  static defaultProps = {
    onKeyDown: noop,
    onChange: noop,
    onSubmit: noop,
    className: '',
    placeholder: ''
  }

  constructor() {
    super()
    this.state = {
      value: '',
      locked: false
    }
  }

  componentDidMount() {
    this.props.accentMode.setNode(this.refs.textarea)
  }

  componentWillReceiveProps({value}) {
    if (!this.props.accentMode.active) this.setState({value})
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.locked) return true
    return !this.state.locked
  }

  onKeyDown(e) {
    this.props.accentMode.set(e.keyCode === 229)

    const isEnter = keyname(e.keyCode) === 'enter'

    if (isEnter) {
      // Always insert a new line to be consistent across browsers.
      if (e.altKey || e.ctrlKey || e.shiftKey) {
        e.preventDefault()
        this.insertLineBreak()
        this.props.onChange(e)
        return
      }

      // Do nothing if user tries to submit an empty text.
      if (!this.refs.textarea.value.trim()) {
        e.preventDefault()
        return
      }
    }

    this.props.onKeyDown(e)

    if (isEnter && !e.defaultPrevented) {
      this.props.onSubmit(e)
    }
  }

  onChange(e) {
    if (this.props.accentMode.active) {
      const {value} = e.target
      this.setState({value, locked: true}, () => {
        this.props.onAccent(value)
        this.setState({locked: false})
      })
      return
    }
    this.props.onChange(e)
  }

  insertLineBreak() {
    const {textarea} = this.refs
    const {selectionStart, selectionEnd, value} = textarea

    textarea.value =
      value.substr(0, selectionStart) +
      '\n' +
      value.substr(selectionEnd)

    textarea.selectionEnd = selectionStart + 1
  }

  render() {
    return (
      <textarea
        {...this.props}
        ref="textarea"
        value={this.state.value}
        onChange={::this.onChange}
        onKeyDown={::this.onKeyDown}></textarea>
    )
  }
}
