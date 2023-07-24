import { Editor } from '@tiptap/react'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const LinkSelector = ({ editor, onClick }: { editor: Editor; onClick: (e) => void }) => {
  return (
    <div className="relative">
      <button
        className="link-menu"
        onClick={(e) => {
          onClick(e)
        }}
      >
        <p className="text">↗</p>
        <p className={editor.isActive('link') ? 'active' : ''}>Link</p>
      </button>
    </div>
  )
}
