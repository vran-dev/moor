import { Table } from '@tiptap/extension-table'
import { InputRule } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { NodeType, Schema } from '@tiptap/pm/model'

function getTableNodeTypes(schema: Schema): { [key: string]: NodeType } {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes
  }

  const roles: { [key: string]: NodeType } = {}

  Object.keys(schema.nodes).forEach((type) => {
    const nodeType = schema.nodes[type]

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType
    }
  })

  schema.cached.tableNodeTypes = roles
  return roles
}

// markdown table regex
export const inputRegex = /^\s*(\|(.*)\|)+\n$/

export const CustomTable = Table.extend({
  addInputRules() {
    // return [nodeInputRule({ find: inputRegex, type: this.type, getAttributes: () => ({})})]
    return [
      new InputRule({
        find: inputRegex,
        handler: (props) => {
          const types = getTableNodeTypes(this.editor.schema)
          const headers: string[] = props.match[2].split('|')
          const colsCount = headers.length
          const rowsCount = 2
          const withHeaderRow = true

          const { tr, selection } = props.state
          const { range } = props

          const headerCells: ProsemirrorNode[] = []
          const cells: ProsemirrorNode[] = []

          for (let index = 0; index < colsCount; index += 1) {
            const content = this.editor.schema.nodes.paragraph.createChecked(
              null,
              this.editor.schema.text(headers[index])
            )
            if (withHeaderRow) {
              const headerCell = types.header_cell.createChecked(null, content)
              if (headerCell) {
                headerCells.push(headerCell)
              }
            } else {
              const cell = types.cell.createChecked(null, content)
              cells.push(cell)
            }
          }
          const rows: ProsemirrorNode[] = []
          for (let index = 0; index < rowsCount; index += 1) {
            rows.push(
              types.row.createChecked(null, withHeaderRow && index === 0 ? headerCells : cells)
            )
          }
          const node = types.table.createChecked(null, rows)
          const offset = selection.anchor + 1
          tr.deleteRange(range.from, range.to)
            .replaceSelectionWith(node)
            .scrollIntoView()
            .setSelection(TextSelection.near(tr.doc.resolve(offset)))
        }
      })
    ]
  }
})

export default CustomTable
