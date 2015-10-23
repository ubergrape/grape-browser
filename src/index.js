import SearchBrowser from './search-browser/Browser'
export {SearchBrowser as SearchBrowser}

import SearchModalBrowser from './search-modal-browser/SearchModalBrowser'
export {SearchModalBrowser as SearchModalBrowser}

import EmojiBrowser from './emoji-browser/Browser'
export {EmojiBrowser as EmojiBrowser}

import GrapeInput from './grape-input/GrapeInput'
export {GrapeInput as GrapeInput}

// Register reactive element.
import 'reactive-elements'
document.registerReact('grape-search-browser', SearchBrowser)
document.registerReact('grape-search-modal-browser', SearchModalBrowser)
document.registerReact('grape-emoji-browser', EmojiBrowser)
document.registerReact('grape-input', GrapeInput)
