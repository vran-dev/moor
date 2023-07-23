/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Editor, isNodeSelection, isTextSelection, posToDOMRect } from '@tiptap/react'
import { EditorView } from 'prosemirror-view'
import tippy, { Instance, Props } from 'tippy.js'

export interface LinkFormPluginProps {
  pluginKey: PluginKey | string
  editor: Editor
  element: HTMLElement | null
  tippyOptions?: Partial<Props>
  updateDelay?: number
}

export class LinkFormView {
  editor: Editor
  element: HTMLElement
  view: EditorView
  preventHide = false
  tippy: Instance | undefined
  private pluginState: () => any
  tippyOptions?: Partial<Props>
  updateDelay?: number
  private updateDebounceTimer: number | undefined

  constructor(view: EditorView, pluginState: () => any, props: LinkFormPluginProps) {
    this.editor = props.editor
    this.element = props.element as HTMLElement
    this.view = view
    this.updateDelay = props.updateDelay
    this.pluginState = pluginState

    this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.addEventListener('dragstart', this.dragstartHandler)
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.tippyOptions = props.tippyOptions
    // Detaches menu content from its current parent
    this.element.remove()
    this.element.style.visibility = 'visible'
  }

  public shouldShow = ({ view, state, from, to }) => {
    const { doc, selection } = state
    const { empty } = selection
    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

    // When clicking on a element inside the bubble menu the editor "blur" event
    // is called and the bubble menu item is focussed. In this case we should
    // consider the menu as part of the editor and keep showing the menu
    const isChildOfMenu = this.element.contains(document.activeElement)

    const hasEditorFocus = view.hasFocus() || isChildOfMenu

    if (!hasEditorFocus || empty || isEmptyTextBlock || !this.editor.isEditable) {
      return false
    }

    return true
  }

  mousedownHandler = () => {
    this.preventHide = true
  }

  dragstartHandler = () => {
    this.hide()
  }

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view))
  }

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false

      return
    }

    if (event?.relatedTarget && this.element.parentNode?.contains(event.relatedTarget as Node)) {
      return
    }

    this.hide()
  }

  tippyBlurHandler = (event: FocusEvent) => {
    this.blurHandler({ event })
  }

  show() {
    this.tippy?.show()
  }

  hide() {
    this.tippy?.hide()
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view
    const hasValidSelection = state.selection.$from.pos !== state.selection.$to.pos

    if (this.updateDelay > 0 && hasValidSelection) {
      this.handleDebouncedUpdate(view, oldState)
      return
    }

    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)

    this.updateHandler(view, selectionChanged, docChanged, oldState)
  }

  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)

    if (!selectionChanged && !docChanged) {
      return
    }

    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer)
    }

    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, selectionChanged, docChanged, oldState)
    }, this.updateDelay)
  }

  updateHandler = (
    view: EditorView,
    selectionChanged: boolean,
    docChanged: boolean,
    oldState?: EditorState
  ) => {
    const { state, composing } = view
    const { selection } = state

    console.log('updating: ', this.pluginState())
    if (!this.pluginState().visible) {
      return
    }
    console.log('updating 2')

    // const isSame = !selectionChanged && !docChanged

    // if (composing || isSame) {
    //   return
    // }

    this.createTooltip()

    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map((range) => range.$from.pos))
    const to = Math.max(...ranges.map((range) => range.$to.pos))

    // const shouldShow = this.shouldShow?.({
    //   editor: this.editor,
    //   view,
    //   state,
    //   oldState,
    //   from,
    //   to
    // })

    // if (!shouldShow) {
    //   console.log('ignored')
    //   this.hide()

    //   return
    // }

    this.tippy?.setProps({
      getReferenceClientRect:
        this.tippyOptions?.getReferenceClientRect ||
        (() => {
          if (isNodeSelection(state.selection)) {
            let node = view.nodeDOM(from) as HTMLElement

            const nodeViewWrapper = node.dataset.nodeViewWrapper
              ? node
              : node.querySelector('[data-node-view-wrapper]')

            if (nodeViewWrapper) {
              node = nodeViewWrapper.firstChild as HTMLElement
            }

            if (node) {
              return node.getBoundingClientRect()
            }
          }

          return posToDOMRect(view, from, to)
        })
    })

    this.show()
  }

  destroy() {
    if (this.tippy?.popper.firstChild) {
      ;(this.tippy.popper.firstChild as HTMLElement).removeEventListener(
        'blur',
        this.tippyBlurHandler
      )
    }
    this.tippy?.destroy()
    this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true })
    this.view.dom.removeEventListener('dragstart', this.dragstartHandler)
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }

  createTooltip() {
    const { element: editorElement } = this.editor.options
    const editorIsAttached = !!editorElement.parentElement

    if (this.tippy || !editorIsAttached) {
      return
    }

    this.tippy = tippy(editorElement, {
      duration: 0,
      getReferenceClientRect: null,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'bottom',
      hideOnClick: 'toggle',
      ...this.tippyOptions
    })

    // maybe we have to hide tippy on its own blur event as well
    if (this.tippy?.popper.firstChild) {
      ;(this.tippy.popper.firstChild as HTMLElement).addEventListener('blur', this.tippyBlurHandler)
    }
  }
}
export const linkFormPluginKey = new PluginKey('link-form-plugin')

export const LinkFormPlugin = (options: LinkFormPluginProps) => {
  return new Plugin({
    key: linkFormPluginKey,
    state: {
      init: () => {
        return { visible: false }
      },
      apply: (tr, value) => {
        const meta = tr.getMeta(linkFormPluginKey)
        console.log(meta)
        if (meta) {
          return meta
        }
        return value
      }
    },
    view: (view) =>
      new LinkFormView(
        view,
        () => {
          return linkFormPluginKey.getState(view.state)
        },
        { ...options }
      )
  })
}
