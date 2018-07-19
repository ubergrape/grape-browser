import stringify from '../stringify'

describe('query', () => {
  describe('.stringify()', () => {
    it('should stringify with trigger only', () => {
      const str = stringify({ trigger: '#' })
      expect(str).toBe('#')
    })

    it('should stringify with a search', () => {
      const str = stringify({
        trigger: '#',
        search: 'something',
      })
      expect(str).toBe('#something')
    })
  })
})
