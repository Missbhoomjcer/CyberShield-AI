import { useRef, useState } from 'react'
import './FileDropzone.css'

function FileDropzone({ selectedFile, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e) => {
  const file = e.target.files[0]
  if (file) onFileSelect(file)
  e.target.value = ''
  }

  return (
    <div
      className={`dropzone${isDragging ? ' dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".exe,.dll"
        hidden
        onChange={handleChange}
      />
      <div className="dropzone-icon">⌁</div>
      {selectedFile ? (
        <>
          <div className="dropzone-filename mono">{selectedFile.name}</div>
          <div className="dropzone-hint">Click or drop another file to replace</div>
        </>
      ) : (
        <>
          <div className="dropzone-title">Drag &amp; drop an EXE or DLL file</div>
          <div className="dropzone-hint">or click to browse</div>
        </>
      )}
      <button
        type="button"
        className="btn-choose"
        onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}
      >
        Choose File
      </button>
    </div>
  )
}

export default FileDropzone