import React from 'react'
import { render, cleanup } from 'react-testing-library'
import GrapeInput from '../GrapeInput'

afterEach(cleanup)

describe('grape-input:', () => {
  describe('GrapeInput()', () => {
    it('should render without props', () => {
      const { container } = render(<GrapeInput />)
      expect(container).toMatchSnapshot()
    })
  })

  describe('GrapeInput set content', () => {
    it('should parse markdown content', done => {
      function onDidMount(component) {
        expect(component.state.value).toBe('@room')
        done()
      }

      const { container } = render(
        <GrapeInput
          onDidMount={onDidMount}
          content="[room](cg://chatgrape|room|1|/chat/slug)"
          focused
        />,
      )
      expect(container).toMatchSnapshot()
    })
  })
})
