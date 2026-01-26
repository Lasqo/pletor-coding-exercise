import './App.css'
import { UploadZone } from './components/UploadZone'
import { ImageGrid } from './components/ImageGrid'

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Image Gallery</h1>
      <UploadZone />
      <ImageGrid />
    </div>
  )
}

export default App
