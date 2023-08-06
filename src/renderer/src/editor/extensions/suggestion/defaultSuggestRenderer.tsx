/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor, ReactRenderer } from '@tiptap/react'
import { SuggestComponent } from './suggestComponent'
import tippy from 'tippy.js'

export const defaultSuggestRenderer = (): any => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(SuggestComponent, {
        props,
        editor: props.editor
      })
      // @ts-ignore
      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => props.editor.view.dom.parentElement,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        onHide(instance) {
          component?.ref?.onHide(instance)
        }
      })
    },

    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      if (!popup?.[0].state.isShown) {
        return
      }
      component?.updateProps(props)
      if (!props.clientRect) {
        return
      }
      popup[0].setProps({
        getReferenceClientRect: props.clientRect
      })
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide()
        return true
      }
      if (!popup?.[0].state.isVisible) {
        return false
      }
      return component?.ref?.onKeyDown(props)
    },

    onExit: () => {
      popup?.[0].destroy()
      component?.destroy()
    }
  }
}
