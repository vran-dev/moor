/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  SerializedElementNode,
  Spread
} from 'lexical'
import { CalloutComponent } from './components/Callout'
import { Children } from 'react'

type SerializedCalloutNode = Spread<
  {
    bgColor: string
    children?: SerializedEditorState
  },
  SerializedDecoratorBlockNode
>

export function convertDetailsElement(domNode: HTMLDetailsElement): DOMConversionOutput | null {
  if (!domNode.classList.contains('lexical-callout')) {
    return null
  }
  const bgColor = domNode.style.backgroundColor
  const node = $createCalloutNode(bgColor)
  return {
    node
  }
}

export class CalloutNode extends DecoratorBlockNode {
  __bgColor: string
  __children?: SerializedEditorState

  constructor(bgColor: string, children?: SerializedEditorState, key?: NodeKey) {
    super('start', key)
    this.__bgColor = bgColor
    this.__children = children
  }

  static getType(): string {
    return 'callout'
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__open, node.__children, node.__key)
  }

  static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
    return {
      details: (domNode: HTMLDetailsElement) => {
        return {
          conversion: convertDetailsElement,
          priority: 1
        }
      }
    }
  }

  static importJSON(serializedNode: SerializedCalloutNode): CalloutNode {
    const node = $createCalloutNode(serializedNode.bgColor)
    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.classList.add('callout')
    element.style.backgroundColor = this.__bgColor
    return { element }
  }

  exportJSON(): SerializedCalloutNode {
    return {
      ...super.exportJSON(),
      bgColor: this.__bgColor,
      children: this.__children,
      type: 'callout',
      version: 1
    }
  }

  getBgColor(): string {
    return this.__bgColor
  }

  setBgColor(bgColor: string): void {
    const self = this.getWritable()
    self.__bgColor = bgColor
  }

  getChildren(): SerializedEditorState | undefined {
    return this.__children
  }

  setChildren(children: SerializedEditorState | undefined): void {
    const self = this.getWritable()
    self.__children = children
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <CalloutComponent bgColor={this.__bgColor} nodeKey={this.__key} state={this.__children} />
    )
  }
}

export function $createCalloutNode(bgColor?: string): CalloutNode {
  return new CalloutNode(bgColor || '#fbfbfb')
}

export function $isCalloutNode(node: LexicalNode | null | undefined): node is CalloutNode {
  return node instanceof CalloutNode
}
