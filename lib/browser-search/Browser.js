'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactJss = require('react-jss');

var _reactJss2 = _interopRequireDefault(_reactJss);

var _lodashArrayFindIndex = require('lodash/array/findIndex');

var _lodashArrayFindIndex2 = _interopRequireDefault(_lodashArrayFindIndex);

var _lodashObjectPick = require('lodash/object/pick');

var _lodashObjectPick2 = _interopRequireDefault(_lodashObjectPick);

var _lodashObjectGet = require('lodash/object/get');

var _lodashObjectGet2 = _interopRequireDefault(_lodashObjectGet);

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

var _services = require('./services');

var services = _interopRequireWildcard(_services);

var _dataUtils = require('./dataUtils');

var dataUtils = _interopRequireWildcard(_dataUtils);

var _reactPureRender = require('react-pure-render'

/**
 * Main search browser component.
 */
);

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
      serviceId: undefined,
      hasIntegrations: undefined,
      canAddIntegrations: undefined,
      orgName: undefined,
      orgOwner: undefined,
      images: undefined,
      onAddIntegration: undefined,
      onSelectTab: undefined,
      onSelectItem: undefined,
      onDidMount: undefined
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
    var onDidMount = this.props.onDidMount;

    if (onDidMount) onDidMount(this);
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
    var serviceId = props.serviceId;

    if (!data) return {};

    var sections = dataUtils.getSections(data, serviceId, props.maxItemsPerSectionInAll);

    var tabs = [];
    if (data) tabs = dataUtils.getTabs(data.services, serviceId);

    return { sections: sections, tabs: tabs, serviceId: serviceId };
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
    var set = false;

    if (selector === 'next') {
      newIndex = currIndex + 1;
      if (newIndex < tabs.length) {
        set = true;
      }
    } else if (selector === 'prev') {
      newIndex = currIndex - 1;
      if (newIndex >= 0) {
        set = true;
      }
    } else {
      newIndex = _lodashArrayFindIndex2['default'](tabs, function (tab) {
        return tab.id === selector;
      });
      set = true;
    }

    if (set) {
      var id = tabs[newIndex].id;

      dataUtils.setSelectedTab(tabs, newIndex);
      var sections = dataUtils.getSections(this.props.data, id, this.props.maxItemsPerSectionInAll);
      dataUtils.setSelectedSection(sections, id);
      dataUtils.setFocusedItemAt(sections, id, 0);
      this.setState({ tabs: tabs, sections: sections, serviceId: id });
      this.props.onSelectTab({ id: id });
    }
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

      if (selector === 'next') newItem = items[focusedIndex + 1];else if (selector === 'prev') newItem = items[focusedIndex - 1];

      if (newItem) id = newItem.id;
    } else id = selector;

    if (id) {
      dataUtils.setFocusedItem(sections, id);
      this.setState({ sections: [].concat(sections) });
    }
  };

  Browser.prototype.getFocusedItem = function getFocusedItem() {
    return dataUtils.getFocusedItem(this.state.sections);
  };

  Browser.prototype.selectItem = function selectItem(id) {
    this.focusItem(id);
    this.props.onSelectItem(this.getFocusedItem());
  };

  Browser.prototype.render = function render() {
    var classes = this.props.sheet.classes;

    return _react2['default'].createElement(
      'div',
      {
        className: classes.browser + ' ' + this.props.className,
        style: _lodashObjectPick2['default'](this.props, 'height', 'maxWidth'),
        onMouseDown: this.onMouseDown.bind(this) },
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

    if (data.results.length) return this.renderService(sections);

    var hasSearch = Boolean(_lodashObjectGet2['default'](data, 'search.text'));
    var hasService = Boolean(_lodashObjectGet2['default'](data, 'search.container'));

    if (hasSearch || hasService) return _react2['default'].createElement(_emptyEmpty2['default'], { text: 'Nothing found' });

    if (this.props.isExternal) {
      var text = 'Write the search term to search ' + data.search.service + '.';
      return _react2['default'].createElement(_emptyEmpty2['default'], { text: text });
    }

    // We have no search, no results and its not an external search.
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

  Browser.prototype.onFocusItem = function onFocusItem(data) {
    this.focusItem(data.id);
  };

  Browser.prototype.onSelectItem = function onSelectItem(data) {
    this.selectItem(data.id);
  };

  Browser.prototype.onSelectTab = function onSelectTab(data) {
    this.selectTab(data.id);
  };

  Browser.prototype.onMouseDown = function onMouseDown(e) {
    // Important!!!
    // Avoids loosing focus and though caret position in editable.
    e.preventDefault();
  };

  var _Browser = Browser;
  Browser = _reactJss2['default'](_browserStyle2['default'])(Browser) || Browser;
  return Browser;
})(_react.Component);

exports['default'] = Browser;
module.exports = exports['default'];