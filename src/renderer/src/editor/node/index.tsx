import type { Klass, LexicalNode } from 'lexical'

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ExcalidrawNode } from './Excalidraw'
import { CodeMirrorNode } from './CodeMirror'
import { IFrameNode } from './IFrame'
import { ImageNode } from './Image'
import { ColumnsNode } from './Columns'

const LexicalNodes: ReadonlyArray<
  | Klass<LexicalNode>
  | {
      replace: Klass<LexicalNode>
      with: <
        T extends {
          new (...args: any): any
        }
      >(
        node: InstanceType<T>
      ) => LexicalNode
    }
> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  HorizontalRuleNode,
  ExcalidrawNode,
  CodeMirrorNode,
  IFrameNode,
  ImageNode,
  ColumnsNode,
  MarkNode,
  {
    replace: CodeNode,
    with: (node: CodeNode): LexicalNode => {
      return new CodeMirrorNode()
    }
  }
]

export default LexicalNodes
