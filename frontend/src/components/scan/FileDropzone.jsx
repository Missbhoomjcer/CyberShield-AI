import { useRef, useState } from 'react'
import './FileDropzone.css'

function FileDropzone({ selectedFile, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]

    if (file) {
      onFileSelect(file)
    }
  }

  const handleChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      onFileSelect(file)
    }

    e.target.value = ''
  }

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  return (
    <div
      className={`dropzone${isDragging ? ' dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={openFilePicker}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".exe,.dll"
        hidden
        onChange={handleChange}
      />

      {/* Upload Icon */}
      <div className="dropzone-icon">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 16V4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M7.5 8.5L12 4l4.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {selectedFile ? (
        <>
          <div className="dropzone-selected">
            <span className="selected-check">✓</span>

            <div>
              <div className="dropzone-filename">
                {selectedFile.name}
              </div>

              <div className="dropzone-file-info">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="dropzone-hint">
            Click or drop another file to replace
          </div>
        </>
      ) : (
        <>
          <div className="dropzone-title">
            Drag &amp; drop an EXE or DLL file
          </div>

          <div className="dropzone-hint">
            or click to browse from your computer
          </div>
        </>
      )}

      <button
        type="button"
        className="btn-choose"
        onClick={(e) => {
          e.stopPropagation()
          openFilePicker()
        }}
      >
        Choose File
      </button>

      <div className="dropzone-supported">
        Supported files: <strong>.EXE</strong> and <strong>.DLL</strong>
      </div>
    </div>
  )
}

export default FileDropzone