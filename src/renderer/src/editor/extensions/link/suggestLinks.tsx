import { CommandProps } from '@tiptap/react'

export interface LinkItem {
  name: string
  description: string
  command: ({ editor, range }: CommandProps) => void
}

const ipcRenderer = window.electron.ipcRenderer

export const suggestLinks = ({ query }: { query: string }): Promise<LinkItem[]> => {
  return ipcRenderer
    .invoke('list-files-recursive', 'E:/ObsidianWorkspace/Vran', query)
    .then((result) => {
      return result.map((item) => {
        const standardPath = item.path.replaceAll('\\', '/')
        const description = standardPath.substring(0, standardPath.lastIndexOf('/'))
        return {
          name: item.name,
          description: description,
          command: ({ editor, range }: CommandProps): void => {
            editor.commands.insertContentAt(range, `[[${item.path}]]`)
          }
        }
      })
    })
}
