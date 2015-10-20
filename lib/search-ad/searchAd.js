'use strict';

exports.__esModule = true;
exports['default'] = create;
var strings = ['attach your documents by typing #filename', 'access over one million funny gifs by typing #gif:', 'find relevant appointments by typing #today or #next week', 'search through the whole wikipedia by typing #wikipedia:', 'post a video by typing #youtube:', 'type @peter to mention Peter', 'type @roomname to mention all people in the room'];
var charDelay = 50;
var stringsDelay = 5000;

function create(callback) {
  var stringsTimeoutId = undefined;
  var charTimeoutId = undefined;
  var currStringNr = 0;
  var currCharNr = 0;
  var initialString = undefined;

  function start(_initialString) {
    initialString = _initialString;
    stop();
    stringsTimeoutId = setTimeout(tick, stringsDelay);
  }

  function end() {
    stop();
    stringsTimeoutId = setTimeout(tick, stringsDelay);
    setTimeout(function () {
      callback(initialString);
    }, 2000);
  }

  function tick() {
    var string = strings[currStringNr];
    // We are done with all strings, start from the beginning.
    if (!string) {
      currStringNr = 0;
      string = strings[currStringNr];
      tick();
      return;
    }
    // We are done with the current animation, point to the next one.
    if (!string[currCharNr]) {
      currStringNr++;
      currCharNr = 0;
      end();
      return;
    }
    var str = string.substr(0, currCharNr + 1);
    currCharNr++;
    charTimeoutId = setTimeout(tick, charDelay);
    callback(str);
  }

  function stop() {
    clearTimeout(stringsTimeoutId);
    clearTimeout(charTimeoutId);
  }

  return { start: start, stop: stop };
}

module.exports = exports['default'];