export const SEARCH_TRIGGER = '#'
export const MENTION_TRIGGER = '@'
export const EMOJI_TRIGGER = ':'

export const TRIGGERS = [SEARCH_TRIGGER, EMOJI_TRIGGER, MENTION_TRIGGER]

export const SEPARATOR = ':'

export const TYPES = {
  search: SEARCH_TRIGGER,
  user: MENTION_TRIGGER,
  room: MENTION_TRIGGER,
  emoji: EMOJI_TRIGGER,
  emojiSuggest: EMOJI_TRIGGER
}

// Match everything after a whitespace followed by any trigger until you match
// another whitespace followed by any trigger or end of text.
export const QUERY_REGEX = /(?:^|\s)([#:@])/
export const EMOJI_REGEX = /(^|\s):\w+:(?=($|\s))/g