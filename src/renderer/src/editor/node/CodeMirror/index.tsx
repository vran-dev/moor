import {
  $isElementNode,
  $isTextNode,
  DOMConversionOutput,
  RangeSelection,
  type DOMConversionMap,
  type DOMExportOutput,
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
  $isDecoratorBlockNode,
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import * as React from 'react'
import { CodeMirrorComponent } from './CodeMirrorComponent'

export type SerializedCodeMirrorNode = Spread<
  {
    data: string
    language: string | undefined | null
  },
  SerializedDecoratorBlockNode
>

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

export class CodeMirrorkNode extends DecoratorBlockNode {
  __data: string
  __language: string | undefined | null

  constructor(data = '', language?: string | null, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__data = data
    this.__language = language
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

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <CodeMirrorComponent
        nodeKey={this.getKey()}
        data={this.getData()}
        language={this.getLanguage()}
      />
    )
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      ...super.exportJSON(),
      data: this.getData(),
      language: this.getLanguage(),
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

  static clone(node: CodeMirrorkNode): CodeMirrorkNode {
    return new CodeMirrorkNode(node.getData(), node.getLanguage(), node.__format)
  }

  static importJSON(json: SerializedCodeMirrorNode): CodeMirrorkNode {
    return new CodeMirrorkNode(json.data, json.language, json.format)
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
): CodeMirrorkNode {
  return new CodeMirrorkNode(data || '', language)
}

export function $isCodeMirrorNode(
  node: CodeMirrorkNode | LexicalNode | null | undefined
): node is CodeMirrorkNode {
  return node instanceof CodeMirrorkNode
}
