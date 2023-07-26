import { CommandProps } from '@tiptap/react'

export interface LinkItem {
  name: string
  description: string
  command: ({ editor, range }: CommandProps) => void
}

const ipcRenderer = window.electron.ipcRenderer

export const suggestLinks = ({ query }: { query: string }): Promise<LinkItem[]> => {
  return ipcRenderer
    .invoke('list-files-recursive', '/Users/vrtia/workspace/data/Vran', query)
    .then((result) => {
      return result.map((item) => {
        return {
          name: item.name,
          description: item.path,
          command: ({ editor, range }: CommandProps): void => {
            editor.commands.insertContentAt(range, `[[${item.path}]]`)
          }
        }
      })
    })
}
