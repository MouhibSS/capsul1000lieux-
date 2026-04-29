import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function FileUploader({ onUploadComplete, maxFiles = 10, listingId }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({})
  const [error, setError] = useState('')
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    setError('')

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles = newFiles.filter(file => {
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError(`File ${file.name} must be JPG or PNG`)
        return false
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 10MB limit`)
        return false
      }

      return true
    })

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (!listingId) {
      setError('Listing ID is required')
      return
    }

    setUploading(true)
    setError('')

    const uploadedUrls = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `user-listings/${listingId}/${fileName}`

        // Create form data for upload
        const formData = new FormData()
        formData.append('file', file)

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('location-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          setError(`Failed to upload ${file.name}: ${uploadError.message}`)
          setUploading(false)
          return
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('location-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl.publicUrl)
        setProgress(prev => ({ ...prev, [i]: 100 }))
      }

      // Call callback with uploaded URLs
      onUploadComplete(uploadedUrls)
      setUploadComplete(true)
      setFiles([])
      setProgress({})
    } catch (err) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center cursor-pointer hover:border-gold hover:bg-surface-low/50 transition-colors"
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto mb-3 text-on-surface-variant" />
          <p className="text-sm font-medium mb-1">
            Drag and drop photos or click to browse
          </p>
          <p className="text-xs text-on-surface-variant">
            JPG or PNG, min 1920×1080, max 10 files, max 10MB each
          </p>
        </label>
      </div>

      {/* File preview list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div
                  className="w-full aspect-video bg-surface-low rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {file.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {progress[index] !== undefined && progress[index] < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white text-sm">{progress[index]}%</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-on-surface-variant mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && !uploadComplete && (
        <button
          type="button"
          onClick={uploadFiles}
          disabled={uploading || files.length === 0}
          className="w-full px-4 py-2 bg-gold text-bg rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {/* Success message */}
      {uploadComplete && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-600 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Upload successful
        </div>
      )}
    </div>
  )
}
