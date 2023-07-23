export const DefaultTab = (props: {
  createPage: () => void
  openFile?: () => void
}): JSX.Element => {
  const mainStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    flexDirection: 'column'
  }
  const controlPaneStyle = {
    maxHeight: '500px',
    maxWidth: '500px',
    minHeight: '300px',
    minWidth: '300px',
    textAlign: 'center',
    margin: '20px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'flex-start'
  }
  return (
    <div style={mainStyle}>
      <div style={controlPaneStyle}>
        <h1>Moor</h1>
        <div>
          <button onClick={props.openFile}>Open or Import file</button>
        </div>
        <div>
          <button onClick={props.createPage}>Create empty page</button>
        </div>
      </div>
    </div>
  )
}
