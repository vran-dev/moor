import { NodeSpec, Schema } from 'prosemirror-model'
import { BlockQuote } from './node/Blockquote'
import { Doc } from './node/Doc'
import { Heading } from './node/Heading'
import { Horizontal } from './node/Horizontal'
import { Paragraph } from './node/Paragraph'
import { Bold } from './mark/Bold'
import { Italic } from './mark/Italic'
import { Code } from './mark/Code'
import { ExcalidrawNode } from './node/Excalidraw'
import { ButtonNode } from './node/Button'
import { CodeBlock } from './node/CodeMirror'

export const MoorSchema: Schema = new Schema({
    nodes: {
        doc: Doc,
        paragraph: Paragraph,
        blockquote: BlockQuote,
        heading: Heading,
        horizontal: Horizontal,
        excalidraw: ExcalidrawNode,
        button: ButtonNode,
        codeblock: CodeBlock,
        text: {
            group: 'inline'
        } as NodeSpec
    },
    marks: {
        bold: Bold,
        italic: Italic,
        code: Code
    }
})
