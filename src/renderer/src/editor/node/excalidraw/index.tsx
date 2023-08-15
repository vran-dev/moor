import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  DecoratorNode,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread
} from 'lexical'

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import { Suspense } from 'react'
import React from 'react'
const ExcalidrawComponent = React.lazy(
  () =>
    // @ts-ignore nothing
    import('./ExcalidrawComponent')
)

export interface ExcalidrawOptions {
  zenEnabled: boolean
  gridEnabled: boolean
  readOnlyEnabled: boolean
  width: number
  height: number
}

export type SerializedExcalidrawNode = Spread<
  {
    data: string
    options: ExcalidrawOptions
  },
  SerializedDecoratorBlockNode
>

export function convertExcalidrawElement(domNode: HTMLElement): DOMConversionOutput | null {
  const excalidrawData = domNode.getAttribute('data-lexical-excalidraw-json')
  if (excalidrawData) {
    const node = $createExcalidrawNode()
    node.__data = excalidrawData
    return {
      node
    }
  }
  return null
}

export class ExcalidrawNode extends DecoratorBlockNode {
  __data: string
  __options: ExcalidrawOptions

  constructor(
    data = '{}',
    options: ExcalidrawOptions = {
      zenEnabled: false,
      gridEnabled: false,
      readOnlyEnabled: false,
      width: 800,
      height: 600
    },
    key?: NodeKey
  ) {
    super('start', key)
    this.__data = data
    this.__options = options
  }

  static getType(): string {
    return 'excalidraw'
  }

  static clone(node: ExcalidrawNode): ExcalidrawNode {
    console.log('clone from', node)
    return new ExcalidrawNode(node.__data, node.__options, node.__key)
  }

  static importJSON(_serializedNode: SerializedExcalidrawNode): ExcalidrawNode {
    return new ExcalidrawNode(_serializedNode.data, _serializedNode.options)
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      div: (domNode: HTMLSpanElement) => {
        if (!domNode.hasAttribute('data-lexical-excalidraw-json')) {
          return null
        }
        return {
          conversion: convertExcalidrawElement,
          priority: 1
        }
      }
    }
  }

  exportJSON(): SerializedExcalidrawNode {
    return {
      ...super.exportJSON(),
      data: this.__data,
      options: this.__options,
      type: 'excalidraw',
      version: 1
    }
  }

  // exportDOM(editor: LexicalEditor): DOMExportOutput {
  //   const element = document.createElement('div')
  //   const content = editor.getElementByKey(this.getKey())
  //   if (content !== null) {
  //     const svg = content.querySelector('svg')
  //     if (svg !== null) {
  //       element.innerHTML = svg.outerHTML
  //     }
  //   }
  //   element.setAttribute('data-lexical-excalidraw-json', this.__data)
  //   return { element }
  // }

  setData(data: string): void {
    const self = this.getWritable()
    self.__data = data
  }

  getData(): string {
    return this.__data
  }

  setOptions(options: ExcalidrawOptions): void {
    const self = this.getWritable()
    self.__options = options
  }

  getOptions(): ExcalidrawOptions {
    return this.__options
  }

  setPartialOptions(options: Partial<ExcalidrawOptions>): void {
    const self = this.getWritable()
    self.__options = {
      ...self.__options,
      ...options
    }
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ExcalidrawComponent nodeKey={this.__key} options={this.__options} data={this.__data} />
      </Suspense>
    )
  }
}

export function $createExcalidrawNode(): ExcalidrawNode {
  return new ExcalidrawNode()
}

export function $isExcalidrawNode(node: LexicalNode | null): node is ExcalidrawNode {
  return node instanceof ExcalidrawNode
}
