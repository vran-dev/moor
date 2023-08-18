import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { $isIFrameNode, IFrameNode, IFrameOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey, ElementFormatType, LexicalEditor, NodeKey } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import EmbedEditor from './components/EmbedEditor'
import { Button } from '@renderer/ui/Button'
import './index.css'
import { useDebounce } from '@renderer/editor/utils/useDebounce'
import {
  BsCodeSquare,
  BsLayoutSidebarInset,
  BsLayoutSidebarInsetReverse,
  BsSquare,
  BsTrash3
} from 'react-icons/bs'
import { RadioButtonGroup } from '@renderer/ui/RadioButtonGroup'
import { Divider } from '@renderer/ui/Divider'

function isEmptyString(str: string | null | undefined): boolean {
  return str === null || str === undefined || str === ''
}

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
  // editing, loading, success, error
  const [status, setStatus] = useState<string>(isEmptyString(props.url) ? 'editing' : 'loading')
  const [editor] = useLexicalComposerContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
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

  const isEditing = useCallback(() => {
    return status === 'editing'
  }, [status])
  const isLoading = useCallback(() => {
    return status === 'loading'
  }, [status])
  const isSuccess = useCallback(() => {
    return status === 'success'
  }, [status])
  const isError = useCallback(() => {
    return status === 'error'
  }, [status])

  return (
    <BlockWithAlignableContents className={className} format={nodeFormat} nodeKey={nodeKey}>
      <div ref={containerRef} className="embed-iframe-container" draggable={true}>
        <ToolMenu editor={editor} nodeKey={nodeKey} nodeFormat={nodeFormat}>
          {!isEditing() && (
            <Button onClick={(e): void => setStatus('editing')} icon={<BsCodeSquare />}>
              source
            </Button>
          )}
        </ToolMenu>
        {(isSuccess() || isLoading()) && (
          <ResizableView
            aspectRatio={ResizableRatioType.Flexible}
            initialSize={{ width: width, height: height }}
            onResized={(e, newWidth, newHeight): void => {
              // containerRef.current?.focus()
              if (newWidth) {
                withIFrameNode((node) => node.setPartialOptions({ width: newWidth }))
              }
              if (newHeight) {
                withIFrameNode((node) => node.setPartialOptions({ height: newHeight }))
              }
            }}
          >
            <iframe
              width="100%"
              height="100%"
              ref={iframeRef}
              src={`${url}`}
              onError={(e): void => {
                setStatus('error')
              }}
              onLoad={(e): void => {
                setStatus('success')
              }}
              allowFullScreen={true}
              sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
            />
          </ResizableView>
        )}

        {isEditing() && (
          <EmbedEditor
            nodeKey={nodeKey}
            defaultData={url}
            onSave={(data): void => {
              if (!data) {
                return
              }
              setStatus('loading')
              editor.update(() => {
                const node = $getNodeByKey(nodeKey)
                if ($isIFrameNode(node)) {
                  node.setData(data)
                }
              })
            }}
            onDelete={(): void => {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey)
                if ($isIFrameNode(node)) {
                  node.selectPrevious()
                  node.remove()
                }
              })
            }}
          />
        )}
      </div>
    </BlockWithAlignableContents>
  )
}

function ToolMenu(props: {
  editor: LexicalEditor
  nodeKey: NodeKey
  nodeFormat: ElementFormatType
  children?: React.ReactNode
}): JSX.Element {
  const { editor, nodeKey, nodeFormat, children } = props
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
    <div
      className="embed-iframe-tool-menu"
      style={{
        justifyContent: getMenuJustifyContentByFormat()
      }}
    >
      {children}
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
  )
}
