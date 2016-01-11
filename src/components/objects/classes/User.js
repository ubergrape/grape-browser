import {getTrigger, encodeMDLink} from '../utils'
import {grapeProtocol} from '../constants'

const tokenType = 'user'
const trigger = getTrigger(tokenType)

export default class User {
  constructor(options) {
    this.tokenType = tokenType
    this.id = options.id
    this.username = options.username
    this.name = options.name
    this.url = '/chat/@' + this.username
    this.content = trigger + this.name
    this.service = 'chatgrape'
    this.type = 'chatgrapeuser'
    this.str = this.toString()
  }

  toString() {
    const url = `${grapeProtocol}chatgrape|user|${this.id}|/chat/@${this.username}`
    return `[${this.name}](${encodeMDLink(url)})`
  }
}
