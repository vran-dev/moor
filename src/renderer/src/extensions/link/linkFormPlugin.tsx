/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import { Editor, isNodeSelection, isTextSelection, posToDOMRect } from '@tiptap/react'
import { Decoration, DecorationSet, DecorationSource, EditorView } from 'prosemirror-view'
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
    const metaTr = this.editor?.view.state.tr.setMeta(linkFormPluginKey, { visible: false })
    this.editor?.view.dispatch(metaTr)
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

    const isSame = !selectionChanged && !docChanged
    if (!this.pluginState().visible) {
      return
    }
    if (this.pluginState().visible && (selectionChanged || docChanged)) {
      if (this.tippy?.state.isShown) {
        this.hide()
      }
      const metaTr = this.editor?.view.state.tr.setMeta(linkFormPluginKey, {
        visible: false,
        decorations: []
      })
      this.editor?.view.dispatch(metaTr)
      return
    }
    if (!this.pluginState().visible && (composing || isSame)) {
      return
    }
    this.preventHide = true
    this.createTooltip()

    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map((range) => range.$from.pos))
    const to = Math.max(...ranges.map((range) => range.$to.pos))

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view,
      state,
      oldState,
      from,
      to
    })

    if (!shouldShow) {
      this.hide()
      return
    }

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
      ; (this.tippy.popper.firstChild as HTMLElement).removeEventListener(
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
      ; (this.tippy.popper.firstChild as HTMLElement).addEventListener('blur', this.tippyBlurHandler)
    }
  }
}
export const linkFormPluginKey = new PluginKey('link-form-plugin')

interface LinkPluginState {
  visible: boolean // show plugin view
  decorations?: Decoration[] | undefined
}

export const LinkFormPlugin = (options: LinkFormPluginProps) => {
  return new Plugin({
    key: linkFormPluginKey,
    state: {
      init: (): LinkPluginState => {
        return { visible: false, decorations: [] }
      },
      apply: (tr, value, oldState, newState): LinkPluginState => {
        const meta: LinkPluginState = tr.getMeta(linkFormPluginKey)
        if (meta) {
          if (meta.visible) {
            const { from, to } = newState.selection
            const decoration = Decoration.inline(from, to, {
              class: 'selection-focus'
            })
            return { visible: true, decorations: [decoration] }
          }
          return meta
        }
        return value
      }
    },
    props: {
      decorations(state): DecorationSource {
        const pluginState: LinkPluginState | undefined = this.getState(state)
        // maybe decorations: [null], shold filter non null values
        const decorations = (pluginState?.decorations || []).filter((d) => d != null)
        if (!decorations.length) {
          return DecorationSet.empty
        }
        return DecorationSet.create(state.doc, decorations)
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
