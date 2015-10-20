'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _grapeThemeDistFonts = require('grape-theme/dist/fonts');

var _grapeThemeDistFonts2 = _interopRequireDefault(_grapeThemeDistFonts);

var _grapeThemeDistBaseColors = require('grape-theme/dist/base-colors');

var _grapeThemeDistBaseColors2 = _interopRequireDefault(_grapeThemeDistBaseColors);

exports['default'] = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: 'solid 1px #E5E5E5'
  },
  icon: {
    color: _grapeThemeDistBaseColors2['default'].gainsboroDark,
    width: 40,
    flexShrink: 0,
    cursor: 'pointer'
  },
  input: _extends({}, _grapeThemeDistFonts2['default'].big, {
    width: '100%',
    color: _grapeThemeDistBaseColors2['default'].grapeTypo,
    border: 'none',
    padding: 15,
    paddingLeft: 0,
    outline: 'none'
  })
};
module.exports = exports['default'];