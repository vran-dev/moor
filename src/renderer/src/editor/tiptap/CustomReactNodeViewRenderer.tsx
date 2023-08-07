/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  DecorationWithType,
  NodeView,
  NodeViewProps,
  NodeViewRenderer,
  NodeViewRendererProps
} from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { DecorationSource, NodeView as ProseMirrorNodeView } from '@tiptap/pm/view'
import React from 'react'
import { Editor, ReactNodeViewRendererOptions } from '@tiptap/react'
import { ReactRenderer } from '@tiptap/react'

import { createContext, useContext } from 'react'

export interface ReactNodeViewContextProps {
  onDragStart: (event: DragEvent) => void
  nodeViewContentRef: (element: HTMLElement | null) => void
}

export const ReactNodeViewContext = createContext<Partial<ReactNodeViewContextProps>>({
  onDragStart: undefined
})

export const useReactNodeView = () => useContext(ReactNodeViewContext)

class CustomReactNodeView extends NodeView<
  React.FunctionComponent,
  Editor,
  ReactNodeViewRendererOptions
> {
  renderer!: ReactRenderer

  contentDOMElement!: HTMLElement | null

  mount() {
    const props: NodeViewProps = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      selected: false,
      extension: this.extension,
      getPos: () => this.getPos(),
      updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
      deleteNode: () => this.deleteNode()
    }

    if (!(this.component as any).displayName) {
      const capitalizeFirstChar = (string: string): string => {
        return string.charAt(0).toUpperCase() + string.substring(1)
      }

      this.component.displayName = capitalizeFirstChar(this.extension.name)
    }

    const ReactNodeViewProvider: React.FunctionComponent = (componentProps) => {
      const Component = this.component
      const onDragStart = this.onDragStart.bind(this)
      const nodeViewContentRef: ReactNodeViewContextProps['nodeViewContentRef'] = (element) => {
        if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
          element.appendChild(this.contentDOMElement)
        }
      }

      return (
        <>
          <ReactNodeViewContext.Provider value={{ onDragStart, nodeViewContentRef }}>
            <Component {...componentProps} />
          </ReactNodeViewContext.Provider>
        </>
      )
    }

    ReactNodeViewProvider.displayName = 'CustomReactNodeView'

    // this.contentDOMElement = this.node.isLeaf
    //   ? null
    //   : document.createElement(this.node.isInline ? 'span' : 'div')

    // if (this.contentDOMElement) {
    //   // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
    //   // With this fix it seems to work fine
    //   // See: https://github.com/ueberdosis/tiptap/issues/1197
    //   this.contentDOMElement.style.whiteSpace = 'inherit'
    // }

    let as = this.node.isInline ? 'span' : 'div'

    if (this.options.as) {
      as = this.options.as
    }

    const { className = '' } = this.options

    if (!this.renderer) {
      this.renderer = new ReactRenderer(ReactNodeViewProvider, {
        editor: this.editor,
        props,
        as,
        className: `node-${this.node.type.name} ${className}`.trim(),
        attrs: this.options.attrs
      })
    }
  }

  get dom() {
    // if (!this.renderer) {
    //   this.mount()
    // }
    if (
      this.renderer.element.firstElementChild &&
      !this.renderer.element.firstElementChild?.hasAttribute('data-node-view-wrapper')
    ) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element as HTMLElement
  }

  // get contentDOM() {
  //   if (this.node.isLeaf) {
  //     return null
  //   }

  //   return this.contentDOMElement
  //   // return null
  // }

  update(
    node: ProseMirrorNode,
    decorations: DecorationWithType[],
    innerDecoration: DecorationSource
  ) {
    const updateProps = (props?: Record<string, any>) => {
      this.renderer.updateProps(props)
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (typeof this.options.update === 'function') {
      const oldNode = this.node
      const oldDecorations = this.decorations

      this.node = node
      this.decorations = decorations

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        updateProps: () => updateProps({ node, decorations, innerDecoration })
      })
    }

    if (node === this.node && this.decorations === decorations) {
      return true
    }

    this.node = node
    this.decorations = decorations

    updateProps({ node, decorations, innerDecoration, selected: false, setSelection: null })

    return true
  }

  selectNode() {
    this.renderer.updateProps({
      selected: true
    })
  }

  deselectNode() {
    this.renderer.updateProps({
      selected: false
    })
  }

  setSelection(anchor: number, head: number, root: Document | ShadowRoot = document): void {
    this.renderer.updateProps({
      selected: false,
      setSelection: {
        anchor,
        head,
        root
      }
    })
  }

  destroy() {
    this.renderer.destroy()
    this.contentDOMElement = null
  }
}

export function CustomReactNodeViewRenderer(
  component: any,
  options?: Partial<ReactNodeViewRendererOptions>
): NodeViewRenderer {
  return (props: NodeViewRendererProps) => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {}
    }

    return new CustomReactNodeView(component, props, options) as unknown as ProseMirrorNodeView
  }
}
