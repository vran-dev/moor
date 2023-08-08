import {
  NodeViewComponentProps,
  ReactComponentExtension,
  ReactComponentOptions
} from '@remirror/react'
import { ComponentType } from 'react'
import {
  ApplySchemaAttributes,
  BaseExtensionOptions,
  Dispose,
  EmptyShape,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  ProsemirrorNode,
  RemoveAnnotations,
  isElementDomNode
} from 'remirror'
import { ExcalidrawNodeView } from './ExcalidrawNodeView'
import { EditorView, NodeView } from 'prosemirror-view'
import { NodeSelection } from 'prosemirror-state'

export class ExcalidrawExtension extends NodeExtension<ReactComponentOptions> {
  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      selectable: true,
      draggable: true,
      ...override,
      inline: false,
      atom: true,
      isolating: true,
      group: 'block',
      attrs: {
        ...extra.defaults(),
        width: {
          default: 600
        },
        height: {
          default: 480
        },
        zenMode: {
          default: false
        },
        gridMode: {
          default: false
        },
        readOnly: {
          default: false
        }
      },
      parseDOM: [
        {
          tag: 'div[data-type="excalidraw"]',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return null
            }
            const width = node.getAttribute('width')
            const height = node.getAttribute('height')
            return {
              ...extra.parse(node),
              width,
              height
            }
          }
        },
        ...(override.parseDOM ?? [])
      ],
      toDOM: (node) => {
        return [
          'div',
          {
            'data-type': 'excalidraw'
          }
        ]
      }
    }
  }

  ReactComponent = ExcalidrawNodeView

  get name(): string {
    return 'excalidraw'
  }
}
