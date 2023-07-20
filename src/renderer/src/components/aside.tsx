import React, { useEffect, useState, useRef } from 'react'

const ipcRenderer = window.electron.ipcRenderer

export const Aside = (props: { onOpenFile: (path: string) => void }): JSX.Element => {
  const [tree, setTree] = useState([])
  const [workspace, setWorkspace] = useState('')
  const [asideWidth, setAsideWidth] = useState(200)
  const rafRef = useRef(null)

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
      ipcRenderer.invoke('list-files', files[0]).then((r) => {
        setTree(r)
      })
    })
  }

  const openFile = (fileName: string) => () => {
    props.onOpenFile(workspace + '/' + fileName)
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const initialWidth = asideWidth
    const initialX = e.clientX
    const min = 100

    const onMouseMove = (e): void => {
      const diff = e.clientX - initialX
      const newWidth = Math.max(initialWidth + diff, min)
      // setAsideWidth(newWidth)
      rafRef.current = requestAnimationFrame(() => {
        setAsideWidth(newWidth)
      })
      e.preventDefault()
    }

    const onMouseUP = (e): void => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUP)
      cancelAnimationFrame(rafRef.current)
      e.preventDefault()
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUP)
  }

  if (tree.length > 0) {
    //foreach tree
    return (
      <>
        <div className="aside" style={{ width: `${asideWidth}px` }}>
          <h2>{workspace}</h2>
          {tree.map((item: { name: string }, index: number) => {
            return (
              <button key={index} className="tree-item" onClick={openFile(item?.name)}>
                {item?.name}
              </button>
            )
          })}
          <div className="resize-x" onMouseDown={onMouseDown}></div>
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="aside" style={{ width: `${asideWidth}px` }}>
          <button onClick={openDirectoryDialog}>select directory</button>
          <div className="resize-x" onMouseDown={onMouseDown}></div>
        </div>
      </>
    )
  }
}
