import parse from '../parse'

describe('query', () => {
  describe('.parse()', () => {
    it('should parse empty query string', () => {
      const query = parse('')
      expect(query).toEqual({
        query: '',
        trigger: undefined,
        search: '',
      })
    })

    it('should parse query with trigger only', () => {
      const query = parse('#')
      expect(query).toEqual({
        query: '#',
        trigger: '#',
        search: '',
      })
    })

    it('should parse query with search', () => {
      const query = parse('#something')
      expect(query).toEqual({
        query: '#something',
        trigger: '#',
        search: 'something',
      })
    })
  })
})
