import React, { useState, useRef, useLayoutEffect } from 'react'
import '@renderer/assets/layout-aside.css'
import { NodeRendererProps, Tree } from 'react-arborist'
import { AiOutlineFolder } from 'react-icons/ai'

const ipcRenderer = window.electron.ipcRenderer

export interface FileInfo {
  name: string
  path: string
  workspace: string
  children?: FileInfo[]
  isDirectory?: boolean
}

export class FileTree {
  id: string
  name: string
  path: string
  isDirectory?: boolean | undefined
  children?: FileTree[] | null

  constructor(id: string, name: string, path: string, isDirectory: boolean, children?: FileTree[]) {
    this.id = id
    this.name = name
    this.path = path
    this.isDirectory = isDirectory
    this.children = children
  }

  static createTree(files: FileInfo[]): FileTree[] {
    return files.map((item) => FileTree.createTreeItem(item))
  }

  static createTreeItem(f: FileInfo): FileTree {
    return {
      id: f.path,
      name: f.name,
      path: f.path,
      isDirectory: f.isDirectory,
      children: f.children ? f.children.map((item) => FileTree.createTreeItem(item)) : null
    }
  }
}
function TreeNode({ node, style, dragHandle }: NodeRendererProps<any>) {
  /* This node instance can do many things. See the API reference. */
  return (
    <div style={style} ref={dragHandle} onClick={() => node.toggle()}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '5px',
          alignItems: 'flex-start',
          // justifyContent: 'flex-start',
          verticalAlign: 'top'
        }}
      >
        <div style={{ width: '16px' }}>{!node.isLeaf && <AiOutlineFolder />}</div>
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            verticalAlign: 'top'
          }}
        >
          {node.data.name}
        </span>
      </div>
    </div>
  )
}

export const Aside = (props: { onOpenFile: (file: FileInfo) => void }): JSX.Element => {
  const [tree, setTree] = useState([])
  const [workspace, setWorkspace] = useState('')
  const containerRef = useRef(null)
  const resizeBorderRef = useRef(null)
  const [asideWidth, setAsideWidth] = useState(300)
  const [asideHeight, setAsideHeight] = useState(800)

  const openDirectoryDialog = () => {
    ipcRenderer.invoke('open-directory-dialog').then((result) => {
      if (!result) {
        return
      }
      const files = result.filePaths
      if (files.length === 0) {
        return
      }

      setWorkspace(files[0])
      ipcRenderer.invoke('list-file-tree', files[0]).then((r: FileInfo[]) => {
        setTree(FileTree.createTree(r))
      })
    })
  }

  const openFile = (fileInfo: FileInfo) => () => {
    props.onOpenFile({
      name: fileInfo.name,
      path: fileInfo.path,
      workspace: workspace,
      isDirectory: fileInfo.isDirectory
    })
  }

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault()
    const initialX = event.clientX
    const min = 100
    resizeBorderRef.current.classList.add('resizing')

    const onMouseMove = (e): void => {
      e.preventDefault()
      const diff = e.clientX - initialX
      const newWidth = Math.max(initialX + diff, min)
      containerRef.current.style.minWidth = `${newWidth}px`
      setAsideWidth(newWidth)
    }

    const onMouseUP = (e): void => {
      e.preventDefault()
      resizeBorderRef.current.classList.remove('resizing')
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUP)
      // cancelAnimationFrame(rafRef.current)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUP)
  }

  useLayoutEffect(() => {
    setAsideHeight(containerRef.current?.clientHeight)
    const resizeListner = (): void => {
      setAsideHeight(containerRef.current?.clientHeight)
    }
    window.addEventListener('resize', resizeListner)
    return () => {
      window.removeEventListener('resize', resizeListner)
    }
  })

  if (tree.length > 0) {
    //foreach tree
    return (
      <>
        <div className="aside" ref={containerRef}>
          <div className="aside-inner">
            <Tree
              initialData={tree}
              openByDefault={false}
              width={asideWidth - 20}
              height={asideHeight}
              onActivate={(node): void => !node.data.isDirectory && openFile(node.data)()}
            >
              {TreeNode}
            </Tree>
          </div>
          <div className="resize-x" onMouseDown={onMouseDown} ref={resizeBorderRef}></div>
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="aside" ref={containerRef}>
          <button onClick={openDirectoryDialog}>select directory</button>
          <div className="resize-x" onMouseDown={onMouseDown} ref={resizeBorderRef}></div>
        </div>
      </>
    )
  }
}
