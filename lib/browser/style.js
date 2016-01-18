'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _grapeThemeDistBaseColors = require('grape-theme/dist/base-colors');

var _grapeThemeDistBaseColors2 = _interopRequireDefault(_grapeThemeDistBaseColors);

var _grapeThemeDistSizes = require('grape-theme/dist/sizes');

var _grapeThemeDistSizes2 = _interopRequireDefault(_grapeThemeDistSizes);

exports['default'] = {
  browser: {
    display: 'flex',
    flexDirection: 'column',
    background: _grapeThemeDistBaseColors2['default'].white,
    borderRadius: _grapeThemeDistSizes2['default'].borderRadius.small,
    overflow: 'hidden',
    boxShadow: '0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15)'
  },
  column: {
    flex: 1,
    display: 'flex',
    minHeight: 1 // firefox 34+ flexbox bug workaround
  },
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    minWidth: 1 // firefox 34+ flexbox bug workaround
  },
  leftColumn: {
    flex: 6,
    overflowY: 'scroll'
  },
  rightColumn: {
    flex: 4,
    display: 'flex',
    minWidth: 256,
    maxWidth: 384,
    overflowX: 'hidden',
    overflowY: 'auto'
  }
};
module.exports = exports['default'];