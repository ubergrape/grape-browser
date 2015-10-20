import React, {Component} from 'react'
import noop from 'lodash/utility/noop'
import {shouldPureComponentUpdate} from 'react-pure-render'

import {useSheet} from '../jss'
import style from './style'
import {TYPES as QUERY_TYPES} from '../query/constants'
import QueryModel from '../query/Model'
import parseQuery from '../query/parse'

@useSheet(style)
export default class Input extends Component {
  static defaultProps = {
    onInput: noop,
    onKeyDown: noop,
    onChangeFilters: noop,
    onBlur: noop,
    type: undefined,
    focused: true,
    filters: undefined,
    search: undefined
  }

  constructor(props) {
    super(props)
    this.query = new QueryModel({onChange: ::this.onChangeQuery})
    this.query.set({
      trigger: QUERY_TYPES[this.props.type],
      filters: props.filters,
      search: props.search
    }, {silent: true})
    this.state = this.createState(props)
  }

  shouldComponentUpdate = shouldPureComponentUpdate

  componentDidMount() {
    if (this.state.focused) this.focus()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filters && String(nextProps.filters) !== String(this.query.get('filters'))) {
      this.onChangeFilters(nextProps)
    }

    if (nextProps.search !== undefined && nextProps.search !== this.query.get('search')) {
      this.query.set('search', nextProps.search, {silent: true})
    }
    let nextState = this.createState(nextProps)
    this.setState(nextState)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.focused && !prevState.focused) {
      this.focus()
    }
  }

  render() {
    let {classes} = this.props.sheet

    return (
      <div className={classes.container}>
        <span
          onClick={::this.onClickIcon}
          className={`fa fa-lg fa-search ${classes.icon}`}></span>
        <input
          value={this.state.value}
          type="text"
          className={classes.input}
          ref="input"
          data-test="input"
          onChange={::this.onInput}
          onKeyDown={::this.onKeyDown}
          onBlur={::this.onBlur} />
      </div>
    )
  }

  createState({focused}) {
    return {
      focused,
      value: this.query.get('key')
    }
  }

  focus() {
    return React.findDOMNode(this.refs.input).focus()
  }

  onClickIcon() {
    this.setState({focused: true})
  }

  onInput(e) {
    let queryStr = QUERY_TYPES[this.props.type] + e.target.value
    let query = parseQuery(queryStr)
    this.query.set(query)
  }

  onBlur() {
    this.setState({focused: false})
    this.props.onBlur()
  }

  onChangeQuery() {
    let query = this.query.toJSON()
    this.setState({value: query.key})
    this.props.onInput(query)
  }

  onKeyDown(e) {
    e.detail = {query: this.query.toJSON()}
    this.props.onKeyDown(e)
  }

  onChangeFilters({filters}) {
    this.query.set('filters', filters, {silent: true})
    this.props.onChangeFilters(this.state.value)
  }
}
