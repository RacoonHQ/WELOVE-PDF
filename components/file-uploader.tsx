"use client"

import type React from "react"

import { useCallback } from "react"
import { Upload, FileText } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      const pdfFile = files.find((file) => file.type === "application/pdf")

      if (pdfFile) {
        if (pdfFile.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB")
          return
        }
        onFileUpload(pdfFile)
      } else {
        alert("Please upload a PDF file")
      }
    },
    [onFileUpload],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      onFileUpload(file)
    }
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your PDF file here</h3>
      <p className="text-gray-500 mb-4">or click to browse</p>

      <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-upload" />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
      >
        <FileText className="w-4 h-4 mr-2" />
        Select PDF File
      </label>

      <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB</p>
    </div>
  )
}
