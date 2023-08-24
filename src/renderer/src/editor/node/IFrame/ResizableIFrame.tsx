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
import { Divider } from '@renderer/ui/Divider'
import { offset, useDismiss, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { VirtualSelect } from '@renderer/ui/Select'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCover } from '@renderer/ui/Cover/useCover'
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { AlignableBlockToolMenu } from '@renderer/ui/AlignableBlockToolMenu'

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

  const [showToollMenu, setShowTollMenu] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: showToollMenu,
    onOpenChange: setShowTollMenu,
    placement: 'top-end',
    middleware: [offset(-35)]
  })
  const hover = useHover(context, {
    move: false
  })
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss])

  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [cover, showCover, hideCover] = useCover()
  useEffect(() => {
    if (selected) {
      showCover()
    } else {
      hideCover()
    }
  }, [selected, showCover, hideCover])
  useDecoratorNodeKeySetting({
    nodeKey: nodeKey,
    editor: editor,
    onSelect: (): boolean => {
      setSelected(true)
      return true
    }
  })
  return (
    <BlockWithAlignableContents className={className} format={nodeFormat} nodeKey={nodeKey}>
      {(isSuccess() || isLoading()) && (
        <ResizableView
          aspectRatio={ResizableRatioType.Flexible}
          initialSize={{ width: width, height: height }}
          onResized={(e, newWidth, newHeight): void => {
            // containerRef.current?.focus()
            if (newWidth) {
              withIFrameNode((node: IFrameNode) => node.setPartialOptions({ width: newWidth }))
            }
            if (newHeight) {
              withIFrameNode((node: IFrameNode) => node.setPartialOptions({ height: newHeight }))
            }
          }}
        >
          <div ref={refs.setReference} {...getReferenceProps()} className="embed-iframe-container">
            {showToollMenu && (
              <div
                ref={refs.setFloating}
                style={{
                  zIndex: 9999,
                  ...floatingStyles
                }}
                {...getFloatingProps()}
              >
                <AlignableBlockToolMenu editor={editor} nodeKey={nodeKey} nodeFormat={nodeFormat}>
                  {!isEditing() && (
                    <Button
                      onClick={(e): void => setStatus('editing')}
                      icon={<BsCodeSquare size={12} />}
                      type="dark"
                    ></Button>
                  )}
                </AlignableBlockToolMenu>
              </div>
            )}
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
              sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-top-navigation-by-user-activation"
            />
          </div>
          {cover}
        </ResizableView>
      )}

      {isEditing() && (
        <div
          style={{
            position: 'relative'
          }}
        >
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
          {cover}
        </div>
      )}
    </BlockWithAlignableContents>
  )
}
