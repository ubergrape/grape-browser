import React from 'react'
import { $, render } from '../../../test'
import GrapeInput from '../GrapeInput'

describe('grape-input:', () => {
  describe('GrapeInput()', () => {
    it('should render without props', () => {
      render(<GrapeInput />)
      expect($('highlighted-editable')).toBeInstanceOf(Element)
    })
  })

  describe('GrapeInput set content', () => {
    it('should parse markdown content', done => {
      let resized = false

      function onDidMount(component) {
        expect(resized).toBe(true)
        expect(component.state.value).toBe('@room')
        done()
      }

      function onResize() {
        resized = true
      }

      const grapeInput = (
        <GrapeInput
          onResize={onResize}
          onDidMount={onDidMount}
          content="[room](cg://chatgrape|room|1|/chat/slug)"
          focused
        />
      )
      render(grapeInput)
    })
  })
})
