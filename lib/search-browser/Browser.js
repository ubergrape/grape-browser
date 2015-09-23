'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodashArrayFindIndex = require('lodash/array/findIndex');

var _lodashArrayFindIndex2 = _interopRequireDefault(_lodashArrayFindIndex);

var _lodashObjectPick = require('lodash/object/pick');

var _lodashObjectPick2 = _interopRequireDefault(_lodashObjectPick);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

var _keyname = require('keyname');

var _keyname2 = _interopRequireDefault(_keyname);

var _reactPureRender = require('react-pure-render');

var _lodashUtilityNoop = require('lodash/utility/noop');

var _lodashUtilityNoop2 = _interopRequireDefault(_lodashUtilityNoop);

var _jss = require('../jss');

var _browserStyle = require('../browser/style');

var _browserStyle2 = _interopRequireDefault(_browserStyle);

var _tabsTabsWithControls = require('../tabs/TabsWithControls');

var _tabsTabsWithControls2 = _interopRequireDefault(_tabsTabsWithControls);

var _itemItem = require('./item/Item');

var _itemItem2 = _interopRequireDefault(_itemItem);

var _emptyEmpty = require('../empty/Empty');

var _emptyEmpty2 = _interopRequireDefault(_emptyEmpty);

var _spinnerSpinner = require('../spinner/Spinner');

var _spinnerSpinner2 = _interopRequireDefault(_spinnerSpinner);

var _inputInput = require('../input/Input');

var _inputInput2 = _interopRequireDefault(_inputInput);

var _services = require('./services');

var services = _interopRequireWildcard(_services);

var _dataUtils = require('./dataUtils');

var dataUtils = _interopRequireWildcard(_dataUtils);

var _queryBuild = require('../query/build');

var _queryBuild2 = _interopRequireDefault(_queryBuild);

var _queryConstants = require('../query/constants');

/**
 * Main search browser component.
 */

var Browser = (function (_Component) {
  _inherits(Browser, _Component);

  _createClass(Browser, null, [{
    key: 'defaultProps',
    value: {
      data: undefined,
      height: 400,
      maxWidth: 920,
      className: '',
      maxItemsPerSectionInAll: 5,
      isExternal: false,
      isLoading: false,
      hasIntegrations: undefined,
      canAddIntegrations: false,
      orgName: undefined,
      orgOwner: undefined,
      images: undefined,
      inputDelay: 500,
      focused: undefined,
      onAddIntegration: _lodashUtilityNoop2['default'],
      onSelectItem: _lodashUtilityNoop2['default'],
      onSelectFilter: _lodashUtilityNoop2['default'],
      onDidMount: _lodashUtilityNoop2['default'],
      onChange: _lodashUtilityNoop2['default'],
      onAbort: _lodashUtilityNoop2['default'],
      onBlur: _lodashUtilityNoop2['default']
    },
    enumerable: true
  }]);

  function Browser(props) {
    _classCallCheck(this, _Browser);

    _Component.call(this, props);
    this.shouldComponentUpdate = _reactPureRender.shouldPureComponentUpdate;
    this.state = this.createState(this.props);
    this.exposePublicMethods();
  }

  Browser.prototype.componentWillReceiveProps = function componentWillReceiveProps(props) {
    this.setState(this.createState(props));
  };

  Browser.prototype.componentDidMount = function componentDidMount() {
    this.props.onDidMount(this);
  };

  Browser.prototype.exposePublicMethods = function exposePublicMethods() {
    var _this = this;

    var container = this.props.container;

    if (!container) return;
    ['selectTab', 'focusItem', 'getFocusedItem'].forEach(function (method) {
      container[method] = _this[method].bind(_this);
    });
  };

  Browser.prototype.createState = function createState(props) {
    var data = props.data;

    if (!data) return {};

    var serviceId = undefined;
    if (this.state && this.state.filters) {
      serviceId = dataUtils.filtersToServiceId(data, this.state.filters);
    }

    var sections = dataUtils.getSections(data, serviceId, props.maxItemsPerSectionInAll);

    var tabs = dataUtils.getTabs(data.services, serviceId);

    var inputDelay = props.isExternal ? props.inputDelay : undefined;

    return { sections: sections, tabs: tabs, inputDelay: inputDelay };
  };

  /**
   * Select tab.
   *
   * @param {String} id can be item id or "prev" or "next"
   */

  Browser.prototype.selectTab = function selectTab(selector) {
    var tabs = this.state.tabs;

    var currIndex = _lodashArrayFindIndex2['default'](tabs, function (tab) {
      return tab.selected;
    });
    var newIndex = undefined;

    if (selector === 'next') {
      newIndex = currIndex + 1;
      if (!tabs[newIndex]) newIndex = 0;
    } else if (selector === 'prev') {
      newIndex = currIndex - 1;
      if (newIndex < 0) newIndex = tabs.length - 1;
    } else {
      newIndex = _lodashArrayFindIndex2['default'](tabs, function (tab) {
        return tab.id === selector;
      });
    }

    var id = tabs[newIndex].id;

    dataUtils.setSelectedTab(tabs, newIndex);
    var sections = dataUtils.getSections(this.props.data, id, this.props.maxItemsPerSectionInAll);
    dataUtils.setSelectedSection(sections, id);
    dataUtils.setFocusedItemAt(sections, id, 0);
    var service = dataUtils.findById(this.props.data.services, id);
    var filters = service ? [service.key] : [];
    this.setState({ tabs: tabs, sections: sections, filters: filters });
  };

  Browser.prototype.focusItem = function focusItem(selector) {
    var sections = this.state.sections;

    var id = undefined;

    if (selector === 'next' || selector === 'prev') {
      var selectedSection = dataUtils.getSelectedSection(sections);
      var items = selectedSection ? selectedSection.items : dataUtils.extractItems(sections);
      var focusedIndex = _lodashArrayFindIndex2['default'](items, function (item) {
        return item.focused;
      });
      var newItem = undefined;

      if (selector === 'next') {
        newItem = items[focusedIndex + 1];
        if (!newItem) newItem = items[0];
      } else if (selector === 'prev') {
        newItem = items[focusedIndex - 1];
        if (!newItem) newItem = items[items.length - 1];
      }

      id = newItem.id;
    } else id = selector;

    if (id) {
      dataUtils.setFocusedItem(sections, id);
      this.setState({ sections: [].concat(sections) });
    }
  };

  Browser.prototype.getFocusedItem = function getFocusedItem() {
    return dataUtils.getFocusedItem(this.state.sections);
  };

  Browser.prototype.render = function render() {
    var classes = this.props.sheet.classes;

    return _react2['default'].createElement(
      'div',
      {
        className: classes.browser + ' ' + this.props.className,
        style: _lodashObjectPick2['default'](this.props, 'height', 'maxWidth'),
        onMouseDown: this.onMouseDown.bind(this),
        'data-test': 'browser' },
      _react2['default'].createElement(_inputInput2['default'], {
        onInput: this.onInput.bind(this),
        onChangeFilters: this.props.onSelectFilter,
        onBlur: this.props.onBlur,
        onKeyDown: this.onKeyDown.bind(this),
        focused: this.props.focused,
        filters: this.state.filters,
        search: this.state.search,
        type: 'search' }),
      this.state.tabs && _react2['default'].createElement(_tabsTabsWithControls2['default'], { data: this.state.tabs, onSelect: this.onSelectTab.bind(this) }),
      this.renderContent(),
      this.props.isLoading && _react2['default'].createElement(_spinnerSpinner2['default'], { image: this.props.images.spinner })
    );
  };

  Browser.prototype.renderContent = function renderContent() {
    var sections = this.state.sections;
    var data = this.props.data;

    if (!data) return null;

    var selectedSection = dataUtils.getSelectedSection(sections);
    if (selectedSection) sections = [selectedSection];

    if (data.results.length && sections.length) return this.renderService(sections);

    var hasSearch = Boolean(_lodashObjectGet2['default'](data, 'search.text'));
    var hasService = Boolean(_lodashObjectGet2['default'](data, 'search.container'));

    if (hasSearch || hasService) return _react2['default'].createElement(_emptyEmpty2['default'], { text: 'Nothing found' });

    if (this.props.isExternal) {
      var text = 'Write the search term to search ' + data.search.service + '.';
      return _react2['default'].createElement(_emptyEmpty2['default'], { text: text });
    }

    // We have no search, no results and its not an external search.
    // Yet we can always render queries suggestions.
    return this.renderService(sections);
  };

  Browser.prototype.renderService = function renderService(data) {
    var Service = services.Default;
    var props = _lodashObjectPick2['default'](this.props, 'hasIntegrations', 'canAddIntegrations', 'images', 'onAddIntegration', 'orgName', 'orgOwner');

    return _react2['default'].createElement(Service, _extends({}, props, {
      Item: _itemItem2['default'],
      data: data,
      focusedItem: this.getFocusedItem(),
      onFocus: this.onFocusItem.bind(this),
      onSelect: this.onSelectItem.bind(this) }));
  };

  /**
   * Keyboard navigation.
   */

  Browser.prototype.navigate = function navigate(e) {
    var query = e.detail.query;

    switch (_keyname2['default'](e.keyCode)) {
      case 'down':
        this.focusItem('next');
        e.preventDefault();
        break;
      case 'up':
        this.focusItem('prev');
        e.preventDefault();
        break;
      case 'right':
      case 'tab':
        this.selectTab('next');
        e.preventDefault();
        break;
      case 'left':
        this.selectTab('prev');
        e.preventDefault();
        break;
      case 'enter':
        this.onSelectItem();
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

  Browser.prototype.onFocusItem = function onFocusItem(_ref) {
    var id = _ref.id;

    this.focusItem(id);
  };

  Browser.prototype.onSelectItem = function onSelectItem() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var id = _ref2.id;

    if (id) this.focusItem(id);
    var item = this.getFocusedItem();
    var trigger = _queryConstants.TYPES.search;

    if (item.type === 'filters') {
      var service = dataUtils.findById(this.props.data.services, item.id);
      var filters = service ? [service.key] : [];
      this.setState({
        search: '',
        filters: filters
      });
      var _query = _queryBuild2['default']({ trigger: trigger, filters: filters });
      this.props.onSelectFilter(_query);
      return;
    }

    var query = _queryBuild2['default']({
      trigger: trigger,
      filters: this.state.filters,
      search: this.state.search
    });
    this.props.onSelectItem({ item: item, query: query });
  };

  Browser.prototype.onSelectTab = function onSelectTab(_ref3) {
    var id = _ref3.id;

    this.selectTab(id);
  };

  Browser.prototype.onKeyDown = function onKeyDown(e) {
    this.navigate(e);
  };

  Browser.prototype.onInput = function onInput(query) {
    var _this2 = this;

    this.setState({
      search: query.search,
      filters: query.filters
    }, function () {
      var _props = _this2.props;
      var inputDelay = _props.inputDelay;
      var onInput = _props.onInput;

      if (!inputDelay) return onInput(query);
      clearTimeout(_this2.onInputTimeoutId);
      _this2.onInputTimeoutId = setTimeout(onInput.bind(null, query), inputDelay);
    });
  };

  Browser.prototype.onMouseDown = function onMouseDown(e) {
    // Avoids loosing focus and though caret position in input.
    e.preventDefault();
  };

  var _Browser = Browser;
  Browser = _jss.useSheet(_browserStyle2['default'])(Browser) || Browser;
  return Browser;
})(_react.Component);

exports['default'] = Browser;
module.exports = exports['default'];