import { IpcHandler } from './ipcInterface'
const { dialog } = require('electron')
import * as fs from 'node:fs'

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

export const openFileDialog = 'open-file-dialog'

/**
 * open dialog
 */
const openFileDialogHandler: IpcHandler = {
  name: openFileDialog,
  handle: async (event, ...args) => {
    return dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
  }
}

export const handlers = [openFileDialogHandler, readFileHandler, writeFileHandler]
