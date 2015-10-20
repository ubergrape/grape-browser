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
    overflow: 'hidden',
    borderRadius: _grapeThemeDistSizes2['default'].borderRadius.bigger,
    boxShadow: ['inset 0 1px 0 rgba(255,255,255,.6)', '0 22px 70px 4px rgba(0,0,0,0.56)', '0 0 0 1px rgba(0, 0, 0, 0.3)'].join(','),
    position: 'relative',
    margin: '0 10%',
    height: 400,
    maxWidth: 920
  },
  column: {
    flex: 1,
    display: 'flex',
    // firefox 34+ flexbox bug workaround
    minHeight: 1
  },
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    // firefox 34+ flexbox bug workaround
    minWidth: 1
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
    overflowY: 'scroll'
  }
};
module.exports = exports['default'];