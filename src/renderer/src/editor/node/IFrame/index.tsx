import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
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
    url: string
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
  __url: string
  __options: IFrameOptions

  constructor(
    url = '',
    options: IFrameOptions = {
      width: 800,
      height: 600
    },
    key?: NodeKey
  ) {
    super('start', key)
    this.__url = url
    this.__options = options
  }

  static getType(): string {
    return IFRAME_NODE_TYPE
  }

  static clone(node: IFrameNode): IFrameNode {
    return new IFrameNode(node.getUrl(), node.getOptions(), node.getKey())
  }

  static importJSON(_serializedNode: SerializedIFrameNode): IFrameNode {
    return new IFrameNode(_serializedNode.url, _serializedNode.options)
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
      url: this.__url,
      options: this.__options,
      type: IFRAME_NODE_TYPE,
      version: 1
    }
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('iframe')
    element.setAttribute('data-lexical-iframe-url', this.__url)
    element.setAttribute('width', `${this.__options.width}px`)
    element.setAttribute('height', `${this.__options.height}px`)
    element.setAttribute('src', `${this.__url}`)
    element.setAttribute('frameborder', '0')
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    )
    element.setAttribute('allowfullscreen', 'true')
    return { element }
  }

  setUrl(url: string): void {
    const self = this.getWritable()
    self.__url = url
  }

  getUrl(): string {
    return this.__url
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
        url={this.__url}
        options={this.__options}
        className={className}
        nodeFormat={this.__format}
        nodeKey={this.__key}
      ></ResizableIFrame>
    )
  }
}

export function $createIFrameNode(): IFrameNode {
  return new IFrameNode()
}

export function $isIFrameNode(node: LexicalNode | null): node is IFrameNode {
  return node instanceof IFrameNode
}
