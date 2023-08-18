import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { $isIFrameNode, IFrameNode, IFrameOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey, ElementFormatType, NodeKey } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import IFramePlaceholder from './components/Placeholder'
import { Button } from '@renderer/ui/Button'
import './index.css'
import { useDebounce } from '@renderer/editor/utils/useDebounce'
import {
  BsCodeSquare,
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
  BsSquare,
  BsTextareaResize,
  BsTrash3
} from 'react-icons/bs'
import { RadioButtonGroup } from '@renderer/ui/RadioButtonGroup'
import { Divider } from '@renderer/ui/Divider'

export function ResizableIFrame(props: {
  url: string
  options: IFrameOptions
  nodeKey: NodeKey
  nodeFormat: ElementFormatType
  className: {
    base: string
    focus: string
  }
}): JSX.Element {
  const [editing, setEditing] = useState<boolean>(false)
  const [editor] = useLexicalComposerContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { width, height } = props.options
  const { nodeKey, className, nodeFormat, url } = props

  const withIFrameNode = useDebounce(
    (callback: (node: IFrameNode) => void, onUpdate?: () => void): void => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isIFrameNode(node)) {
            callback(node)
          }
        },
        { onUpdate }
      )
    },
    50,
    1000
  )

  const removeNode = useCallback(() => {
    withIFrameNode((node) => {
      node.remove()
    })
  }, [nodeKey])

  // get focus when clicked
  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    const mouseClickHandler = (e: MouseEvent): void => {
      if (!e.target || !(e.target as HTMLElement).closest('.embed-iframe-container')) {
        return
      }
      containerRef.current?.focus()
    }
    document.addEventListener('mousedown', mouseClickHandler)
    return () => {
      document.removeEventListener('mousedown', mouseClickHandler)
    }
  }, [])

  const layoutButtonItems = [
    {
      icon: <BsLayoutSidebarInset />,
      label: 'start',
      onClick: (e) =>
        withIFrameNode((node) => {
          node.setFormat('start')
        })
    },
    {
      icon: <BsSquare />,
      label: 'center',
      onClick: (e) =>
        withIFrameNode((node) => {
          node.setFormat('center')
        })
    },
    {
      icon: <BsLayoutSidebarInsetReverse />,
      label: 'end',
      onClick: (e) =>
        withIFrameNode((node) => {
          node.setFormat('end')
        })
    }
  ]

  const getMenuJustifyContentByFormat = (): string => {
    if (nodeFormat === 'right' || nodeFormat === 'end') {
      return 'end'
    }
    if (nodeFormat === 'center') {
      return 'center'
    }
    return 'start'
  }

  const defaultLayoutActiveIndex = layoutButtonItems.findIndex((b) => b.label === nodeFormat)
  return (
    <BlockWithAlignableContents className={className} format={nodeFormat} nodeKey={nodeKey}>
      <div ref={containerRef} className="embed-iframe-container" draggable={true}>
        <div
          className="embed-iframe-tool-menu"
          style={{
            justifyContent: getMenuJustifyContentByFormat()
          }}
        >
          {!editing && url && (
            <Button onClick={(e): void => setEditing(!editing)} icon={<BsCodeSquare />}>
              source
            </Button>
          )}
          <Button onClick={(): void => removeNode()} icon={<BsTrash3 />}>
            <span>remove</span>
          </Button>
          <Divider direction="vertical"></Divider>
          <RadioButtonGroup
            items={layoutButtonItems}
            defaultActiveIndex={defaultLayoutActiveIndex < 0 ? 0 : defaultLayoutActiveIndex}
          ></RadioButtonGroup>
          {/* TODO support save snapshot time */}
          {/* <Button onClick={() => {}}>Snapshot</Button> */}
        </div>
        {url && !editing && (
          <ResizableView
            aspectRatio={ResizableRatioType.Flexible}
            initialSize={{ width: width, height: height }}
            onResized={(e, newWidth, newHeight): void => {
              if (newWidth) {
                withIFrameNode((node) => node.setPartialOptions({ width: newWidth }))
              }
              if (newHeight) {
                withIFrameNode((node) => node.setPartialOptions({ height: newHeight }))
              }
            }}
          >
            <iframe width="100%" height="100%" src={`${url}`} allowFullScreen={true} />
          </ResizableView>
        )}

        {(!url || editing) && (
          <IFramePlaceholder
            defaultData={url}
            onSave={(data): void => {
              if (!data) {
                return
              }
              editor.update(() => {
                const node = $getNodeByKey(nodeKey)
                if ($isIFrameNode(node)) {
                  node.setData(data)
                  setEditing(false)
                }
              })
            }}
          />
        )}
      </div>
    </BlockWithAlignableContents>
  )
}
