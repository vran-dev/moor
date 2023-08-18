import './index.css'
import { BiLoader } from 'react-icons/bi'

export function EmbedLoading(props: { message: string }): JSX.Element {
  const { message } = props
  return (
    <div className="embed-loading-container">
      <span className="embed-loading-icon">
        <BiLoader />
      </span>
      <span className="embed-loading-message">{message}</span>
    </div>
  )
}
