import {
  DOMConversionOutput,
  RangeSelection,
  type DOMConversionMap,
  type EditorConfig,
  type ElementFormatType,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type Spread,
  $setSelection,
  $createNodeSelection,
  $createRangeSelection
} from 'lexical'

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import * as React from 'react'
import { CodeMirrorComponent } from './CodeMirrorComponent'

export type SerializedCodeMirrorNode = Spread<
  {
    data: string
    language: string | undefined | null
    layout: CodeblockLayout
  },
  SerializedDecoratorBlockNode
>

export enum CodeblockLayout {
  Code = 'Code',
  Preview = 'Preview',
  SplitVertical = 'SplitVertical'
}

export function convertCodeMirrorElement(domNode: HTMLElement): DOMConversionOutput | null {
  const data = domNode.getAttribute('data-lexical-codemirror-json')
  if (data) {
    const node = $createCodeMirrorNode(data)
    return {
      node
    }
  }
  return null
}

export class CodeMirrorNode extends DecoratorBlockNode {
  __data: string
  __language: string | undefined | null
  __layout: CodeblockLayout

  constructor(
    data = '',
    language?: string | null,
    layout?: CodeblockLayout,
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key)
    this.__data = data
    this.__language = language
    this.__layout = layout ? layout : CodeblockLayout.SplitVertical
  }

  setData(data: string): void {
    const writable = this.getWritable()
    writable.__data = data
  }

  getData(): string {
    return this.__data
  }

  setLanguage(language: string | undefined | null): void {
    const writable = this.getWritable()
    writable.__language = language
  }

  getLanguage(): string | undefined | null {
    return this.__language
  }

  setLayout(layout: CodeblockLayout): void {
    const writable = this.getWritable()
    writable.__layout = layout
  }

  getLayout(): CodeblockLayout {
    return this.__layout
  }

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <CodeMirrorComponent
        nodeKey={this.getKey()}
        data={this.getData()}
        language={this.getLanguage()}
        layout={this.getLayout()}
      />
    )
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      ...super.exportJSON(),
      data: this.getData(),
      language: this.getLanguage(),
      layout: this.getLayout(),
      type: 'codemirror',
      version: 1
    }
  }

  isInline(): false {
    return false
  }

  getTextContent(): string {
    return this.__data
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  selectNext(anchorOffset?: number, focusOffset?: number): RangeSelection {
    const nextSibling = this.getNextSibling()
    if ($isCodeMirrorNode(nextSibling)) {
      const ns = $createNodeSelection()
      ns.add(nextSibling.getKey())
      $setSelection(ns)
      // FIXME return empty range selection to avoid Compile Warning
      return $createRangeSelection()
    } else {
      // fallback to default behavior
      return super.selectNext(anchorOffset, focusOffset)
    }
  }

  selectPrevious(
    anchorOffset?: number | undefined,
    focusOffset?: number | undefined
  ): RangeSelection {
    const previousSibling = this.getPreviousSibling()
    if ($isCodeMirrorNode(previousSibling)) {
      const ns = $createNodeSelection()
      ns.add(previousSibling.getKey())
      $setSelection(ns)
      // FIXME return empty range selection to avoid Compile Warning
      return $createRangeSelection()
    } else {
      // fallback to default behavior
      return super.selectPrevious(anchorOffset, focusOffset)
    }
  }

  static getType(): string {
    return 'codemirror'
  }

  static clone(node: CodeMirrorNode): CodeMirrorNode {
    return new CodeMirrorNode(
      node.getData(),
      node.getLanguage(),
      node.getLayout(),
      node.__format,
      node.__key
    )
  }

  static importJSON(json: SerializedCodeMirrorNode): CodeMirrorNode {
    return new CodeMirrorNode(json.data, json.language, json.layout, json.format)
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      div: (domNode: HTMLSpanElement) => {
        if (!domNode.hasAttribute('data-lexical-codemirror-json')) {
          return null
        }
        return {
          conversion: convertCodeMirrorElement,
          priority: 1
        }
      }
    }
  }
}

export function $createCodeMirrorNode(
  data?: string | null,
  language?: string | null
): CodeMirrorNode {
  return new CodeMirrorNode(data || '', language)
}

export function $isCodeMirrorNode(
  node: CodeMirrorNode | LexicalNode | null | undefined
): node is CodeMirrorNode {
  return node instanceof CodeMirrorNode
}
