import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import HomePage from './components/EverythingComponents/HomePage'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      
      <HomePage/>
    </>
  )
}

export default App
