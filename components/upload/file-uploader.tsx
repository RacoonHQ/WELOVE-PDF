"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, AlertCircle, CheckCircle, Trash2, File } from "lucide-react"
import type { UploadedFile } from "@/types"

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void
  uploadedFiles: UploadedFile[]
  onRemoveFile: (id: string) => void
  onClearAllFiles: () => void
}

export function FileUploader({ onFilesUpload, uploadedFiles, onRemoveFile, onClearAllFiles }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed"
    }
    if (file.size > 25 * 1024 * 1024) {
      return "File size must be less than 25MB"
    }
    return null
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const validFiles: File[] = []
      const errors: string[] = []

      files.forEach((file) => {
        // Add validation to ensure file is valid
        if (!file || !file.name) {
          errors.push(`Invalid file object`)
          return
        }

        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        alert(`Some files were rejected:\n${errors.join("\n")}`)
      }

      if (validFiles.length > 0) {
        if (uploadedFiles.length + validFiles.length > 10) {
          alert("Maximum 10 files allowed")
          return
        }
        onFilesUpload(validFiles)
      }
    },
    [onFilesUpload, uploadedFiles.length],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      // Add validation to ensure file is valid
      if (!file || !file.name) {
        errors.push(`Invalid file object`)
        return
      }

      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join("\n")}`)
    }

    if (validFiles.length > 0) {
      if (uploadedFiles.length + validFiles.length > 10) {
        alert("Maximum 10 files allowed")
        return
      }
      onFilesUpload(validFiles)
    }

    // Reset input
    e.target.value = ""
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const truncateFileName = (fileName: string, maxLength = 30) => {
    if (fileName.length <= maxLength) return fileName
    const extension = fileName.split(".").pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + "..."
    return `${truncatedName}.${extension}`
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all ${
          isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload
          className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
        />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {isDragOver ? "Drop your PDF files here" : "Upload PDF Files"}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Drag and drop up to 10 PDF files or click to browse
        </p>

        <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 cursor-pointer transition-all"
        >
          <FileText className="w-5 h-5 mr-2" />
          Select PDF Files
        </label>

        <div className="mt-4 text-sm text-gray-500">
          <p>Maximum file size: 25MB per file</p>
          <p>Supported format: PDF only</p>
          <p>Files uploaded: {uploadedFiles.length}/10</p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Uploaded Files</h4>
              <Badge variant="secondary" className="text-xs">
                {uploadedFiles.length}
              </Badge>
            </div>
            {uploadedFiles.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAllFiles}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate" title={file.name}>
                        {truncateFileName(file.name)}
                      </p>
                      {file.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {file.status === "error" && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        PDF
                      </Badge>
                    </div>

                    {file.status === "processing" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Uploading...</span>
                          <span className="text-xs text-gray-600">{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}

                    {file.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {file.error}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(file.id)}
                    className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 rounded-full p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
