'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _expectJs = require('expect.js');

var _expectJs2 = _interopRequireDefault(_expectJs);

var _ = require('../');

describe('objects: Room', function () {
  var object = _.create('room', {
    id: '1',
    slug: 'slug',
    name: 'name'
  });

  describe('Room#toString', function () {
    it('should return correct md', function () {
      _expectJs2['default'](object.toString()).to.be('[name](cg://chatgrape|room|1|/chat/slug)');
    });
  });
});