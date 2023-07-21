import React, { useState, useRef } from 'react'

const ipcRenderer = window.electron.ipcRenderer

export const Aside = (props: { onOpenFile: (path: string) => void }): JSX.Element => {
  const [tree, setTree] = useState([])
  const [workspace, setWorkspace] = useState('')
  const containerRef = useRef(null)
  const resizeBorderRef = useRef(null)

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
      // setAsideWidth(newWidth)
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

  if (tree.length > 0) {
    //foreach tree
    return (
      <>
        <div className="aside" ref={containerRef}>
          <h2>{workspace}</h2>
          {tree.map((item: { name: string }, index: number) => {
            return (
              <button key={index} className="tree-item" onClick={openFile(item?.name)}>
                {item?.name}
              </button>
            )
          })}
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
