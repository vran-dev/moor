import { BrowserWindow } from 'electron'
import { IpcHandler } from './ipcInterface'
const { dialog } = require('electron')
import * as fs from 'node:fs'
import path from 'path'

export const writeFileChannel = 'file-write'

/**
 * arg[0] = filePath
 * arg[1] = content
 * arg[2] = options
 */
const writeFileHandler: IpcHandler = {
  name: writeFileChannel,
  handle: async (event, ...args) => {
    const filePath = args[0]
    const content = args[1]
    const options = args[2]
    fs.writeFileSync(filePath, content, options)
  }
}

export const readFileChannel = 'file-read'

/**
 * arg[0] = filePath
 */
const readFileHandler: IpcHandler = {
  name: readFileChannel,
  handle: async (event, ...args) => {
    const filePath = args[0]
    const stats = fs.statSync(filePath)
    const isDirectory = stats.isDirectory()
    if (isDirectory) {
      return null
    } else {
      return fs.readFileSync(args[0], 'utf-8')
    }
  }
}

export const listFilesChannel = 'list-files'
const listFileHandler: IpcHandler = {
  name: listFilesChannel,
  handle: async (event, ...args) => {
    const dir = args[0]
    const stats = fs.statSync(dir)
    const isDirectory = stats.isDirectory()
    if (isDirectory) {
      return fs.readdirSync(dir, {
        withFileTypes: true
      })
    } else {
      return null
    }
  }
}

export const openFileDialog = 'open-file-dialog'

/**
 * open file dialog
 */
const openFileDialogHandler: IpcHandler = {
  name: openFileDialog,
  handle: async (event, ...args) => {
    const browserWindow = BrowserWindow.getFocusedWindow()
    if (browserWindow) {
      return dialog.showOpenDialog(browserWindow, { properties: ['openFile'] })
    }
  }
}

export const openDirectoryDialog = 'open-directory-dialog'

/**
 * open directory dialog
 */
const openDirectoryHandler: IpcHandler = {
  name: openDirectoryDialog,
  handle: async (event, ...args) => {
    const browserWindow = BrowserWindow.getFocusedWindow()
    if (browserWindow) {
      return dialog.showOpenDialog(browserWindow, { properties: ['openDirectory'] })
    }
  }
}

interface FileInfo {
  name: string
  path: string
  size: number
  children?: FileInfo[]
}

// 获取目录下的所有文件和子目录
const listFilesRecursive = (dir, fileName): FileInfo[] => {
  const files = fs.readdirSync(dir)
  let fileList: FileInfo[] = []
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      fileList = fileList.concat(listFilesRecursive(filePath, fileName))
    } else if (stats.isFile()) {
      if (!fileName || fileName === '') {
        fileList.push({
          name: file,
          path: filePath,
          size: stats.size
        })
      } else if (file.includes(fileName)) {
        fileList.push({
          name: file,
          path: filePath,
          size: stats.size
        })
      }
    }
  }
  return fileList
}
const listFilesRecursiveHandler: IpcHandler = {
  name: 'list-files-recursive',
  handle: (event, ...args) => {
    const dir = args[0]
    const term = args[1]
    return listFilesRecursive(dir, term)
  }
}

const listFileTree = (dir, searchTerm): FileInfo[] => {
  const files = fs.readdirSync(dir)
  const fileList: FileInfo[] = []
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      const childDir: FileInfo = {
        name: file,
        path: filePath,
        size: stats.size,
        children: []
      }
      const childFiles = listFileTree(filePath, searchTerm)
      childDir.children = childDir.children?.concat(childFiles)
      fileList.push(childDir)
    } else if (stats.isFile()) {
      fileList.push({
        name: file,
        path: filePath,
        size: stats.size
      })
    }
  }
  return fileList
}

const listFileTreeHandler: IpcHandler = {
  name: 'list-file-tree',
  handle: (event, ...args) => {
    const dir = args[0]
    const term = args[1]
    return listFileTree(dir, term)
  }
}

export const handlers = [
  openFileDialogHandler,
  openDirectoryHandler,
  listFileHandler,
  readFileHandler,
  writeFileHandler,
  listFilesRecursiveHandler,
  listFileTreeHandler
]
