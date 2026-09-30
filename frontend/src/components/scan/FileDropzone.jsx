import { useRef, useState } from 'react'

import { useLanguage } from '../../context/LanguageContext.jsx'

import './FileDropzone.css'


function FileDropzone({
  selectedFile,
  onFileSelect
}) {

  const { t } = useLanguage()

  const [isDragging, setIsDragging] =
    useState(false)

  const inputRef = useRef(null)


  /* =========================================================
     DROP
     ========================================================= */

  const handleDrop = (event) => {

    event.preventDefault()

    setIsDragging(false)


    const file =
      event.dataTransfer.files[0]


    if (file) {
      onFileSelect(file)
    }

  }


  /* =========================================================
     FILE INPUT
     ========================================================= */

  const handleChange = (event) => {

    const file =
      event.target.files[0]


    if (file) {
      onFileSelect(file)
    }


    event.target.value = ''

  }


  /* =========================================================
     OPEN FILE PICKER
     ========================================================= */

  const openFilePicker = () => {

    inputRef.current?.click()

  }


  return (

    <div

      className={
        `dropzone${
          isDragging
            ? ' dragging'
            : ''
        }`
      }

      onDragOver={(event) => {

        event.preventDefault()

        setIsDragging(true)

      }}

      onDragLeave={() =>
        setIsDragging(false)
      }

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


      {/* =====================================================
          UPLOAD ICON
          ===================================================== */}

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


      {/* =====================================================
          SELECTED FILE
          ===================================================== */}

      {selectedFile ? (

        <>

          <div className="dropzone-selected">

            <span className="selected-check">
              ✓
            </span>


            <div>

              <div className="dropzone-filename">

                {selectedFile.name}

              </div>


              <div className="dropzone-file-info">

                {(selectedFile.size / 1024).toFixed(1)}
                {' KB'}

              </div>

            </div>

          </div>


          <div className="dropzone-hint">

            {t('clickOrDropAnother')}

          </div>

        </>

      ) : (

        <>

          <div className="dropzone-title">

            {t('dragDropFile')}

          </div>


          <div className="dropzone-hint">

            {t('orClickBrowse')}

          </div>

        </>

      )}


      {/* =====================================================
          CHOOSE FILE
          ===================================================== */}

      <button

        type="button"

        className="btn-choose"

        onClick={(event) => {

          event.stopPropagation()

          openFilePicker()

        }}

      >

        {t('chooseFile')}

      </button>


      {/* =====================================================
          SUPPORTED FILES
          ===================================================== */}

      <div className="dropzone-supported">

        {t('supportedFiles')}:

        {' '}

        <strong>
          .EXE
        </strong>

        {' '}

        and

        {' '}

        <strong>
          .DLL
        </strong>

      </div>

    </div>

  )
}


export default FileDropzone