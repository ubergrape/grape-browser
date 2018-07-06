import {
  create as createObject,
  getOptions as getObjectOptions,
} from 'grape-web/lib/grape-objects'

// This regex is taken from "marked" module almost "as it is".
// At the beginning "^!?" has been removed to match all objects.
// We don't use full md parser because its harder to setup it to ignore
// everything except of links.
const linkRegExp = /\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/g

export function toMarkdown(tokens, objects) {
  return tokens
    .map(token => (objects[token] ? objects[token].str : token))
    .join('')
}

/**
 * Parse all grape-protocol markdown links, emoji and
 * convert them to special data object.
 */
export function fromMarkdown(md) {
  const objects = {}

  const value = md.replace(linkRegExp, (match, token, url) => {
    const options = getObjectOptions(token, url)
    if (!options) return match
    const object = createObject(options.type, options)
    objects[object.content] = object

    return object.content
  })

  return { objects, value }
}
