'use strict';

exports.__esModule = true;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodashArrayFindIndex = require('lodash/array/findIndex');

var _lodashArrayFindIndex2 = _interopRequireDefault(_lodashArrayFindIndex);

var _lodashObjectPick = require('lodash/object/pick');

var _lodashObjectPick2 = _interopRequireDefault(_lodashObjectPick);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

var _lodashObjectAssign = require('lodash/object/assign');

var _lodashObjectAssign2 = _interopRequireDefault(_lodashObjectAssign);

var _lodashUtilityNoop = require('lodash/utility/noop');

var _lodashUtilityNoop2 = _interopRequireDefault(_lodashUtilityNoop);

var _keyname = require('keyname');

var _keyname2 = _interopRequireDefault(_keyname);

var _reactPureRender = require('react-pure-render');

var _grapeWebLibJss = require('grape-web/lib/jss');

var _browserStyle = require('./browserStyle');

var _browserStyle2 = _interopRequireDefault(_browserStyle);

var _tabsTabsWithControls = require('../tabs/TabsWithControls');

var _tabsTabsWithControls2 = _interopRequireDefault(_tabsTabsWithControls);

var _gridGrid = require('../grid/Grid');

var _gridGrid2 = _interopRequireDefault(_gridGrid);

var _itemItem = require('./item/Item');

var _itemItem2 = _interopRequireDefault(_itemItem);

var _dataUtils = require('./dataUtils');

var dataUtils = _interopRequireWildcard(_dataUtils);

var _emoji = require('../emoji');

var emoji = _interopRequireWildcard(_emoji);

var _inputInput = require('../input/Input');

var _inputInput2 = _interopRequireDefault(_inputInput);

var _emptyEmpty = require('../empty/Empty');

var _emptyEmpty2 = _interopRequireDefault(_emptyEmpty);

var _globalEventGlobalEvent = require('../global-event/GlobalEvent');

var _globalEventGlobalEvent2 = _interopRequireDefault(_globalEventGlobalEvent);

var PUBLIC_METHODS = ['focusItem', 'getFocusedItem'];

function init(options) {
  var emojiSheet = options.emojiSheet;
  var customEmojis = options.customEmojis;

  if (emojiSheet) emoji.setSheet(emojiSheet);
  if (customEmojis) emoji.defineCustom(customEmojis);
  dataUtils.init();
}

/**
 * Main emoji browser component.
 */

var Browser = (function (_Component) {
  _inherits(Browser, _Component);

  _createClass(Browser, null, [{
    key: 'propTypes',
    value: {
      sheet: _react.PropTypes.object.isRequired,
      onDidMount: _react.PropTypes.func,
      onAbort: _react.PropTypes.func,
      onSelectItem: _react.PropTypes.func,
      onBlur: _react.PropTypes.func,
      container: _react.PropTypes.element,
      className: _react.PropTypes.string,
      focused: _react.PropTypes.bool,
      images: _react.PropTypes.object
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      images: {},
      height: 400,
      maxWidth: 292,
      right: 0,
      className: '',
      onSelectItem: _lodashUtilityNoop2['default'],
      onBlur: _lodashUtilityNoop2['default'],
      onDidMount: _lodashUtilityNoop2['default'],
      onAbort: _lodashUtilityNoop2['default']
    },
    enumerable: true
  }]);

  function Browser(props) {
    _classCallCheck(this, Browser);

    _Component.call(this, props);
    this.shouldComponentUpdate = _reactPureRender.shouldPureComponentUpdate;
    this.exposePublicMethods();
    this.state = this.createState(this.props, {});
  }

  Browser.prototype.componentDidMount = function componentDidMount() {
    this.props.onDidMount(this);
    this.cacheItemsPerRow();
  };

  Browser.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState) {
    _lodashObjectAssign2['default'](nextState, this.createState(nextProps, nextState));
  };

  Browser.prototype.componentDidUpdate = function componentDidUpdate() {
    this.cacheItemsPerRow();
  };

  Browser.prototype.componentWillUnmount = function componentWillUnmount() {
    this.grid = null;
  };

  Browser.prototype.onFocusItem = function onFocusItem(_ref) {
    var id = _ref.id;

    this.focusItem(id);
  };

  Browser.prototype.onSelectItem = function onSelectItem(_ref2) {
    var id = _ref2.id;

    this.selectItem(id);
  };

  Browser.prototype.onSelectTab = function onSelectTab(_ref3) {
    var id = _ref3.id;

    this.selectTab(id);
  };

  Browser.prototype.onGridDidMount = function onGridDidMount(grid) {
    this.grid = grid;
  };

  Browser.prototype.onInput = function onInput(_ref4) {
    var search = _ref4.search;

    this.setState({
      search: search,
      facet: search ? 'search' : undefined
    });
  };

  Browser.prototype.onKeyDown = function onKeyDown(e) {
    this.navigate(e);
  };

  Browser.prototype.onMouseDown = function onMouseDown(e) {
    // Avoids loosing focus and though caret position in input.
    e.preventDefault();
  };

  Browser.prototype.onResize = function onResize() {
    this.cacheItemsPerRow();
  };

  Browser.prototype.getFocusedItem = function getFocusedItem() {
    return dataUtils.getFocusedItem(this.state.sections);
  };

  Browser.prototype.createState = function createState(nextProps, nextState) {
    var currEmojiSheet = _lodashObjectGet2['default'](this.props, 'images.emojiSheet');
    var newEmojiSheet = _lodashObjectGet2['default'](nextProps, 'images.emojiSheet');
    if (newEmojiSheet && (newEmojiSheet !== currEmojiSheet || !emoji.get())) {
      init({
        emojiSheet: newEmojiSheet,
        customEmojis: nextProps.customEmojis
      });
    }

    var facet = nextState.facet;
    var search = nextState.search;

    if (facet !== 'search') search = null;
    var sections = dataUtils.getSections(search, facet);

    var tabs = dataUtils.getTabs({
      orgLogo: nextProps.images.orgLogo,
      selected: facet,
      hasSearch: Boolean(nextState.search)
    });

    return { tabs: tabs, facet: facet, sections: sections };
  };

  Browser.prototype.exposePublicMethods = function exposePublicMethods() {
    var _this = this;

    var container = this.props.container;

    if (!container) return;
    PUBLIC_METHODS.forEach(function (method) {
      return container[method] = _this[method].bind(_this);
    });
  };

  Browser.prototype.cacheItemsPerRow = function cacheItemsPerRow() {
    var sections = this.state.sections;

    if (!sections.length) return;

    var sectionComponent = this.grid.getSectionComponent(sections[0].id);
    var contentComponent = sectionComponent.getContentComponent();

    var _ReactDOM$findDOMNode$getBoundingClientRect = _reactDom2['default'].findDOMNode(contentComponent).getBoundingClientRect();

    var gridWidth = _ReactDOM$findDOMNode$getBoundingClientRect.width;

    // Speed up if grid width didn't change.
    if (this.itemsPerRow && gridWidth === this.gridWidth) return;
    this.gridWidth = gridWidth;

    var id = _lodashObjectGet2['default'](this.state, 'sections[0].items[0].id');
    if (!id) return;

    var component = this.grid.getItemComponent(id);
    var itemWidth = _reactDom2['default'].findDOMNode(component).offsetWidth;
    this.itemsPerRow = Math.floor(gridWidth / itemWidth);
  };

  /**
   * Select tab.
   *
   * @param {String} selector can be facet, "prev" or "next"
   */

  Browser.prototype.selectTab = function selectTab(selector) {
    var tabs = this.state.tabs;

    var facet = selector;
    var currIndex = _lodashArrayFindIndex2['default'](tabs, function (tab) {
      return tab.selected;
    });
    if (selector === 'next') {
      if (tabs[currIndex + 1]) facet = tabs[currIndex + 1].id;else facet = tabs[0].id;
    } else if (selector === 'prev') {
      if (tabs[currIndex - 1]) facet = tabs[currIndex - 1].id;else facet = tabs[tabs.length - 1].id;
    }
    this.setState({ facet: facet });
  };

  Browser.prototype.focusItem = function focusItem(id) {
    var sections = this.state.sections;

    if (!sections.length) return;
    var nextItemId = id;
    var nextItem = dataUtils.getItem(sections, nextItemId, this.itemsPerRow);
    if (nextItem) nextItemId = nextItem.id;

    var prevItem = dataUtils.getFocusedItem(sections);

    var prevComponent = this.grid.getItemComponent(prevItem.id);
    if (prevComponent) prevComponent.setState({ focused: false });

    var nextComponent = this.grid.getItemComponent(nextItemId);
    if (nextComponent) nextComponent.setState({ focused: true });

    dataUtils.setFocusedItem(sections, nextItemId);
  };

  Browser.prototype.selectItem = function selectItem(id) {
    this.focusItem(id);
    this.props.onSelectItem({ item: this.getFocusedItem() });
  };

  /**
   * Keyboard navigation.
   */

  Browser.prototype.navigate = function navigate(e) {
    var query = e.detail.query;

    switch (_keyname2['default'](e.keyCode)) {
      case 'down':
        this.focusItem('nextRow');
        e.preventDefault();
        break;
      case 'up':
        this.focusItem('prevRow');
        e.preventDefault();
        break;
      case 'left':
        this.focusItem('prev');
        e.preventDefault();
        break;
      case 'right':
        this.focusItem('next');
        e.preventDefault();
        break;
      case 'enter':
        this.props.onSelectItem({ item: this.getFocusedItem() });
        e.preventDefault();
        break;
      case 'tab':
        this.selectTab(e.shiftKey ? 'prev' : 'next');
        e.preventDefault();
        break;
      case 'esc':
        this.props.onAbort({
          reason: 'esc',
          query: query
        });
        e.preventDefault();
        break;
      case 'backspace':
        if (!query.key) {
          this.props.onAbort({
            reason: 'backspace',
            query: query
          });
          e.preventDefault();
        }
        break;

      default:
    }
  };

  Browser.prototype.render = function render() {
    var classes = this.props.sheet.classes;
    var sections = this.state.sections;

    return _react2['default'].createElement(
      'div',
      {
        className: classes.browser + ' ' + this.props.className,
        style: _lodashObjectPick2['default'](this.props, 'height', 'maxWidth', 'right'),
        onMouseDown: this.onMouseDown.bind(this) },
      _react2['default'].createElement(_globalEventGlobalEvent2['default'], {
        event: 'resize',
        handler: this.onResize.bind(this),
        debounce: 500 }),
      _react2['default'].createElement(_inputInput2['default'], {
        onInput: this.onInput.bind(this),
        onBlur: this.props.onBlur,
        onKeyDown: this.onKeyDown.bind(this),
        focused: this.props.focused,
        className: classes.input,
        type: 'emoji' }),
      _react2['default'].createElement(_tabsTabsWithControls2['default'], { data: this.state.tabs, onSelect: this.onSelectTab.bind(this) }),
      !sections.length && _react2['default'].createElement(_emptyEmpty2['default'], { text: 'No emoji found.' }),
      sections.length > 0 && _react2['default'].createElement(
        'div',
        { className: classes.column },
        _react2['default'].createElement(
          'div',
          { className: classes.row },
          _react2['default'].createElement(_gridGrid2['default'], {
            data: sections,
            images: this.props.images,
            Item: _itemItem2['default'],
            focusedItem: dataUtils.getFocusedItem(sections),
            className: classes.leftColumn,
            section: { contentClassName: classes.sectionContent },
            onFocus: this.onFocusItem.bind(this),
            onSelect: this.onSelectItem.bind(this),
            onDidMount: this.onGridDidMount.bind(this) })
        )
      )
    );
  };

  return Browser;
})(_react.Component);

var PublicBrowser = _grapeWebLibJss.useSheet(Browser, _browserStyle2['default']);
PublicBrowser.init = init;

exports['default'] = PublicBrowser;
module.exports = exports['default'];