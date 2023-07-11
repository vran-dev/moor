import mermaid from 'mermaid'
import { NodeViewWrapper, Editor } from '@tiptap/react'
import { ReactNode, useState, useEffect, useRef } from 'react'

const MermaidWrapper = (props: {
  editor: Editor
  node: Node
  updateAttributes: (attributes: any) => void
  getPos: () => number
}): ReactNode => {
  const containerRef = useRef(null)
  const [data, setData] = useState(props.node.textContent)
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false })
    mermaid
      .run({
        nodes: [containerRef.current]
      })
      .then(() => {
        // do something after mermaid runs
      })
  }, [data])
  return (
    <>
      <NodeViewWrapper>
        <div className="not-prose">
          <pre ref={containerRef} contentEditable={false}>{data}</pre>
        </div>
      </NodeViewWrapper>
    </>
  )
}

export default MermaidWrapper
