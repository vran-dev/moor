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
  $createRangeSelection,
  DOMExportOutput,
  DOMConversion
} from 'lexical'

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import * as React from 'react'
import { CodeMirrorComponent } from './CodeMirrorComponent'
import { isHTMLElement } from '@renderer/editor/utils/guard'

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
  const language = domNode.getAttribute(LANGUAGE_DATA_ATTRIBUTE)
  return {
    node: $createCodeMirrorNode(domNode.textContent || '', 'Text')
  }
}

const LANGUAGE_DATA_ATTRIBUTE = 'data-codeblock-language'
const LAYOUT_DATA_ATTRIBUTE = 'data-codeblock-layout'

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

  exportDOM(): DOMExportOutput {
    const element = document.createElement('pre')
    element.setAttribute('spellcheck', 'false')
    const language = this.getLanguage()
    if (language) {
      element.setAttribute(LANGUAGE_DATA_ATTRIBUTE, language)
    }
    const layout = this.getLayout()
    if (layout) {
      element.setAttribute(LAYOUT_DATA_ATTRIBUTE, layout)
    }
    element.innerText = this.getData() || ''
    return { element }
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
      pre: (node: Node) => ({
        conversion: convertCodeMirrorElement,
        priority: 4
      }),
      code: (node: Node) => {
        const code = node as HTMLElement
        const pre: HTMLPreElement | null = code.closest('pre')
        if (pre) {
          return {
            conversion: () => {
              return { node: null }
            },
            priority: 4
          }
        }
        return null
      },
      span: (node: Node): DOMConversion | null => {
        const span = node as HTMLSpanElement
        const pre: HTMLPreElement | null = span.closest('pre')
        if (pre) {
          return {
            conversion: () => {
              return { node: null }
            },
            priority: 4
          }
        }
        return null
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

function hasChildDOMNodeTag(node: Node, tagName: string): boolean {
  for (const child of node.childNodes) {
    if (isHTMLElement(child) && child.tagName === tagName) {
      return true
    }
    hasChildDOMNodeTag(child, tagName)
  }
  return false
}
