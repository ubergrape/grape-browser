import React, {Component, PropTypes} from 'react'
import noop from 'lodash/utility/noop'

export default class InputWithScrollEvent extends Component {
  static propTypes = {
    onAccent: PropTypes.func,
    onKeyDown: PropTypes.func,
    onChange: PropTypes.func,
    accentMode: PropTypes.object.isRequired,
    scrollDetectionEvents: PropTypes.array,
    onScroll: PropTypes.func
  }

  static defaultProps = {
    scrollDetectionEvents: ['onInput', 'onKeyDown', 'onKeyUp', 'onFocus',
      'onBlur', 'onClick', 'onChange', 'onPaste', 'onCut', 'onMouseDown',
      'onMouseUp', 'onMouseOver'],
    onScroll: noop,
    onAccent: noop,
    onKeyDown: noop,
    onChange: noop
  }

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      locked: false
    }
    this.handlers = this.createScrollDetectionHandlers()
  }

  componentDidMount() {
    this.props.accentMode.setNode(this.refs.input)
    this.scrollPosition = this.getScrollPosition()
  }

  componentWillReceiveProps({value}) {
    if (!this.props.accentMode.active) this.setState({value})
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!nextState.locked) return true
    return !this.state.locked
  }

  onScroll({target}) {
    const prevPos = this.scrollPosition
    const currPos = this.getScrollPosition()
    if (prevPos.top !== currPos.top || prevPos.left !== currPos.left) {
      this.scrollPosition = currPos
      this.props.onScroll({target})
    }
  }

  onKeyDown(e) {
    this.props.accentMode.set(e.keyCode === 229)
    this.props.onKeyDown(e)
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

  onEventProxy(name, e) {
    // Use delay because native scroll happens after some of the events.
    setTimeout(() => {
      const target = this.refs.input
      // Don't trigger onScroll if the element has been detached.
      if (target) this.onScroll({target})
    })
    // Call original callback if it exists.
    if (this[name]) {
      this[name](e)
      return
    }
    if (this.props[name]) this.props[name](e)
  }

  getScrollPosition() {
    const {scrollLeft, scrollTop} = this.refs.input
    return {left: scrollLeft, top: scrollTop}
  }

  createScrollDetectionHandlers() {
    return this.props.scrollDetectionEvents.reduce((handlers, name) => {
      handlers[name] = this.onEventProxy.bind(this, name)
      return handlers
    }, {})
  }

  render() {
    return (
      <input
        {...this.props}
        {...this.handlers}
        value={this.state.value}
        ref="input" />
    )
  }
}
