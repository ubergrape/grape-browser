const strings = [
  'attach your documents by typing #filename',
  'access over one million funny gifs by typing #gif:',
  'find relevant appointments by typing #today or #next week',
  'search through the whole wikipedia by typing #wikipedia:',
  'post a video by typing #youtube:',
  'type @peter to mention Peter',
  'type @roomname to mention all people in the room'
]
const charDelay = 50
const stringsDelay = 5000

export default function create(callback) {
  let stringsTimeoutId
  let charTimeoutId
  let currStringNr = 0
  let currCharNr = 0
  let initialString

  function start(_initialString) {
    initialString = _initialString
    stop()
    stringsTimeoutId = setTimeout(tick, stringsDelay)
  }

  function end() {
    stop()
    stringsTimeoutId = setTimeout(tick, stringsDelay)
    setTimeout(() => {
      callback(initialString)
    }, 2000)
  }

  function tick() {
    let string = strings[currStringNr]
    // We are done with all strings, start from the beginning.
    if (!string) {
      currStringNr = 0
      string = strings[currStringNr]
      tick()
      return
    }
    // We are done with the current animation, point to the next one.
    if (!string[currCharNr]) {
      currStringNr++
      currCharNr = 0
      end()
      return
    }
    let str = string.substr(0, currCharNr + 1)
    currCharNr++
    charTimeoutId = setTimeout(tick, charDelay)
    callback(str)
  }

  function stop() {
    clearTimeout(stringsTimeoutId)
    clearTimeout(charTimeoutId)
  }

  return {start, stop}
}
