import { IpcMainInvokeEvent } from 'electron'

export interface IpcHandler {
  name: string

  handle(event: IpcMainInvokeEvent, ...args: any[]): Promise<void> | any
}

export interface IpcListener {
  name: string
  on(event: IpcMainInvokeEvent, ...args: any[]): Promise<void> | any
}
