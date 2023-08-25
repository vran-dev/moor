import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread
} from 'lexical'

type SerializedCalloutNextNode = Spread<
  {
    bgColor: string
  },
  SerializedElementNode
>

export function convertDetailsElement(domNode: HTMLDetailsElement): DOMConversionOutput | null {
  if (!domNode.classList.contains('lexical-callout')) {
    return null
  }
  const bgColor = domNode.style.backgroundColor
  const node = $createCalloutNextNode(bgColor)
  return {
    node
  }
}

export class CalloutNextNode extends ElementNode {
  __bgColor: string

  constructor(bgColor: string, key?: NodeKey) {
    super(key)
    this.__bgColor = bgColor
  }

  static getType(): string {
    return 'callout-next'
  }

  static clone(node: CalloutNextNode): CalloutNextNode {
    return new CalloutNextNode(node.__bgColor, node.__key)
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

  static importJSON(serializedNode: SerializedCalloutNextNode): CalloutNextNode {
    const node = $createCalloutNextNode(serializedNode.bgColor)
    return node
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const element = document.createElement('div')
    element.classList.add('callout-next')
    element.style.backgroundColor = this.__bgColor
    return element
  }

  updateDOM(_prevNode: CalloutNextNode, _dom: HTMLElement, _config: EditorConfig): boolean {
    if (_prevNode.__bgColor !== this.__bgColor) {
      _dom.style.backgroundColor = this.__bgColor
    }
    return false
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.classList.add('callout-next')
    element.style.backgroundColor = this.__bgColor
    return { element }
  }

  exportJSON(): SerializedCalloutNextNode {
    return {
      ...super.exportJSON(),
      bgColor: this.__bgColor,
      type: 'callout-next',
      version: 1
    }
  }

  isShadowRoot(): boolean {
    return true
  }

  canBeEmpty(): false {
    return false
  }

  canIndent(): false {
    return false
  }

  getBgColor(): string {
    return this.__bgColor
  }

  setBgColor(bgColor: string): void {
    const self = this.getWritable()
    self.__bgColor = bgColor
  }
}

export function $createCalloutNextNode(bgColor?: string): CalloutNextNode {
  const calloutNode = new CalloutNextNode(bgColor || '#fbfbfb')
  return calloutNode
}

export function $isCalloutNextNode(node: LexicalNode | null | undefined): node is CalloutNextNode {
  return node instanceof CalloutNextNode
}
