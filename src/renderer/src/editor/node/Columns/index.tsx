import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'
import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  Spread
} from 'lexical'
import { ColumnsComponent } from './ColumnsComponent'

export type SerializedColumnNode = Spread<
  {
    count: number
    widthRatio: Array<number>
    children: Array<SerializedEditorState>
  },
  SerializedDecoratorBlockNode
>

export const COLUMNS_NODE_TYPE = 'columns'

export class ColumnsNode extends DecoratorBlockNode {
  __count: number
  __widthRatio: Array<number> = []
  __children: Array<SerializedEditorState> = []

  constructor(
    count: number,
    widthRatio?: number[],
    children?: Array<SerializedEditorState>,
    key?: NodeKey
  ) {
    // count must greater than 0
    if (count <= 0) {
      throw new Error('count must greater than 0')
    }

    super('start', key)
    this.__count = count
    this.__widthRatio =
      widthRatio && widthRatio.length == count ? widthRatio : Array(count).fill(1 / count)
    this.__children = children || []
  }

  static getType(): string {
    return COLUMNS_NODE_TYPE
  }

  static clone(node: ColumnsNode): ColumnsNode {
    return new ColumnsNode(node.__count, node.__widthRatio, node.__children, node.__key)
  }

  static importJSON(_serializedNode: SerializedColumnNode): ColumnsNode {
    return new ColumnsNode(
      _serializedNode.count,
      _serializedNode.widthRatio,
      _serializedNode.children
    )
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (_node: HTMLElement) => ({
        conversion: convertColumnNode,
        priority: 1
      })
    }
  }

  getTag(): string {
    return 'div'
  }

  exportJSON(): SerializedColumnNode {
    return {
      ...super.exportJSON(),
      count: this.__count,
      widthRatio: this.__widthRatio,
      children: this.__children,
      type: COLUMNS_NODE_TYPE
    }
  }

  getChildren(): Array<SerializedEditorState> {
    return this.__children
  }

  setChildren(_children: Array<SerializedEditorState>): void {
    const self = this.getWritable()
    self.__children = _children
  }

  replaceChildren(index: number, state: SerializedEditorState): void {
    const self = this.getWritable()
    const childrenClone = Array.from(self.__children)
    childrenClone[index] = state
    self.__children = childrenClone
  }

  getWidthRatio(): Array<number> {
    return this.__widthRatio
  }

  setWidthRatio(_widthRatio: Array<number>): void {
    const self = this.getWritable()
    self.__widthRatio = _widthRatio
  }

  getCount(): number {
    return this.__count
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return (
      <ColumnsComponent
        count={this.__count}
        widthRatio={this.__widthRatio}
        nodeKey={this.__key}
        states={this.__children}
      ></ColumnsComponent>
    )
  }
}

export function convertColumnNode(_domNode: HTMLElement): DOMConversionOutput {
  if (_domNode.dataset.lexicalNodeType && _domNode.dataset.lexicalNodeType === COLUMNS_NODE_TYPE) {
    const count = _domNode.dataset.lexicalColumnNodeCount
    return { node: $createColumnNode(Number(count)) }
  }
}

export function $createColumnNode(count: number, widthRatio?: number[]): ColumnsNode {
  return $applyNodeReplacement(new ColumnsNode(count, widthRatio || []))
}

export function $isColumnNode(node: LexicalNode | null | undefined): node is ColumnsNode {
  return node instanceof ColumnsNode
}
