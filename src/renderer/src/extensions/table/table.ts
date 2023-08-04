import { Table } from '@tiptap/extension-table'
import { InputRule } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { NodeType, Schema } from '@tiptap/pm/model'
import { CellSelection, TableMap } from '@tiptap/pm/tables'
import { findParentNodeClosestToPos, KeyboardShortcutCommand } from '@tiptap/core'
import ProsemirrorNodes from '@renderer/common/prosemirrorNodes'

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

export const deleteTableWhenAllCellsSelected: KeyboardShortcutCommand = ({ editor }) => {
  const { selection } = editor.state

  if (!isCellSelection(selection)) {
    return false
  }

  let cellCount = 0
  const table = findParentNodeClosestToPos(selection.ranges[0].$from, (node) => {
    return node.type.name === 'table'
  })

  table?.node.descendants((node) => {
    if (node.type.name === 'table') {
      return false
    }

    if (['tableCell', 'tableHeader'].includes(node.type.name)) {
      cellCount += 1
    }
  })

  const allCellsSelected = cellCount === selection.ranges.length

  if (!allCellsSelected) {
    return false
  }

  editor.commands.deleteTable()

  return true
}

export function isCellSelection(value: unknown): value is CellSelection {
  return value instanceof CellSelection
}

// markdown table regex
export const inputRegex = /^\s*(\|(.*)\|)+\n$/

export const CustomTable = Table.extend({
  addKeyboardShortcuts() {
    return {
      Tab: (): boolean => {
        if (this.editor.commands.goToNextCell()) {
          return true
        }

        if (!this.editor.can().addRowAfter()) {
          return false
        }

        return this.editor.chain().addRowAfter().goToNextCell().run()
      },
      'Shift-Tab': (): boolean => this.editor.commands.goToPreviousCell(),
      Backspace: deleteTableWhenAllCellsSelected,
      'Mod-Backspace': deleteTableWhenAllCellsSelected,
      Delete: deleteTableWhenAllCellsSelected,
      'Mod-Delete': deleteTableWhenAllCellsSelected,
      'Mod-a': (): boolean => {
        const selection = this.editor.view.state.selection
        if (isCellSelection(selection)) {
          // selectall
          return this.editor.commands.selectAll()
        }

        const tablePos = ProsemirrorNodes.getAncestorNodePos(
          this.editor.view,
          () => selection.$from.pos,
          'table'
        )
        if (tablePos != null) {
          const node = this.editor.state.doc.nodeAt(tablePos)
          if (node != null) {
            const tableCache = TableMap.get(node)
            const cellSelection = CellSelection.create(
              this.editor.state.doc,
              tablePos + tableCache.map[0] + 1,
              tablePos + tableCache.map[tableCache.map.length - 1] + 1
            )
            this.editor.view.dispatch(this.editor.state.tr.setSelection(cellSelection))
            return true
          }
        }

        return false
      }
    }
  },

  addInputRules() {
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
