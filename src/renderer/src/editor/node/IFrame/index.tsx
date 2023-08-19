import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread
} from 'lexical'

import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import { ResizableIFrame } from './ResizableIFrame'

export interface IFrameOptions {
  width: number
  height: number
}

export type SerializedIFrameNode = Spread<
  {
    data: string
    options: IFrameOptions
  },
  SerializedDecoratorBlockNode
>

export function converIFrameElement(domNode: HTMLElement): DOMConversionOutput | null {
  const excalidrawData = domNode.getAttribute('data-lexical-excalidraw-json')
  if (excalidrawData) {
    const node = $createIFrameNode()
    node.__data = excalidrawData
    return {
      node
    }
  }
  return null
}

export const IFRAME_NODE_TYPE = 'iframe'

export class IFrameNode extends DecoratorBlockNode {
  __data: string
  __options: IFrameOptions

  constructor(
    data = '',
    options: IFrameOptions = {
      width: 800,
      height: 600
    },
    key?: NodeKey,
    format?: ElementFormatType
  ) {
    super(format, key)
    this.__data = data
    this.__options = options
  }

  static getType(): string {
    return IFRAME_NODE_TYPE
  }

  static clone(node: IFrameNode): IFrameNode {
    return new IFrameNode(node.getData(), node.getOptions(), node.getKey(), node.__format)
  }

  static importJSON(_serializedNode: SerializedIFrameNode): IFrameNode {
    return new IFrameNode(_serializedNode.data, _serializedNode.options)
  }

  static importDOM(): DOMConversionMap<HTMLSpanElement> | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-iframe-url')) {
          return null
        }
        return {
          conversion: converIFrameElement,
          priority: 1
        }
      }
    }
  }

  exportJSON(): SerializedIFrameNode {
    return {
      ...super.exportJSON(),
      data: this.__data,
      options: this.__options,
      type: IFRAME_NODE_TYPE,
      version: 1
    }
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('iframe')
    element.setAttribute('data-lexical-iframe-url', this.extractUrlFromData())
    element.setAttribute('width', `${this.__options.width}px`)
    element.setAttribute('height', `${this.__options.height}px`)
    element.setAttribute('src', `${this.extractUrlFromData()}`)
    element.setAttribute('frameborder', '0')
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    )
    element.setAttribute('allowfullscreen', 'true')
    return { element }
  }

  setData(data: string): void {
    const self = this.getWritable()
    self.__data = data
  }

  getData(): string {
    return this.__data
  }

  setOptions(options: IFrameOptions): void {
    const self = this.getWritable()
    self.__options = options
  }

  getOptions(): IFrameOptions {
    return this.__options
  }

  setPartialOptions(options: Partial<IFrameOptions>): void {
    const self = this.getWritable()
    self.__options = {
      ...self.__options,
      ...options
    }
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  updateDOM(): false {
    return false
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || ''
    }
    return (
      <ResizableIFrame
        url={this.extractUrlFromData()}
        options={this.__options}
        className={className}
        nodeFormat={this.__format}
        nodeKey={this.__key}
      ></ResizableIFrame>
    )
  }

  extractUrlFromData(): string {
    if ($isIFrameTag(this.__data)) {
      const regex = /<iframe\b[^>]*\bsrc\s*=\s*(['"]?)(.*?)\1[^>]*>/i
      const match = regex.exec(this.__data)
      if (match) {
        const src = match[2]
        return src
      }
      console.warn('can not extract url from iframe')
      return ''
    } else {
      return this.__data
    }
  }
}

export function $createIFrameNode(data?: string): IFrameNode {
  return new IFrameNode(data)
}

export function $isIFrameNode(node: LexicalNode | null): node is IFrameNode {
  return node instanceof IFrameNode
}

export function $isIFrameTag(data: string): boolean {
  const regex = /^<iframe\b[^>]*>[^<]*<\/iframe>$/
  return regex.test(data)
}
