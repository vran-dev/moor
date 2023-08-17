import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { $isIFrameNode, IFrameNode, IFrameOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getNodeByKey, ElementFormatType, NodeKey } from 'lexical'
import { useCallback, useRef, useState } from 'react'
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import IFramePlaceholder from './components/Placeholder'
import { Button } from '@renderer/ui/Button'
import './index.css'
import { useDebounce } from '@renderer/editor/utils/useDebounce'

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
  const [editing, setEditing] = useState<booolean>(false)
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

  return (
    <div ref={containerRef} className="embed-iframe-container" draggable={true}>
      <div>
        {!editing && url && <Button onClick={(e): void => setEditing(!editing)}>Source</Button>}
        <Button onClick={(): void => removeNode()}>Remove</Button>
        {/* TODO support save snapshot time */}
        {/* <Button onClick={() => {}}>Snapshot</Button> */}
      </div>
      {url && !editing && (
        <BlockWithAlignableContents className={className} format={nodeFormat} nodeKey={nodeKey}>
          {
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
          }
        </BlockWithAlignableContents>
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
                node.setUrl(data)
                setEditing(false)
              }
            })
          }}
        />
      )}
    </div>
  )
}
