"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MockConverter } from "@/lib/mock-converter"
import type { UploadedFile, ConversionFormat, FormatSettings, ConvertedFile } from "@/types"
import { Play, Pause, Download, RefreshCw, CheckCircle, AlertCircle, Package, FileText } from "lucide-react"

interface BatchProcessorProps {
  files: UploadedFile[]
  formats: ConversionFormat[]
  settings: FormatSettings
  onFilesUpdate: (files: UploadedFile[]) => void
  onConversionComplete?: () => void
}

export function BatchProcessor({ files, formats, settings, onFilesUpdate, onConversionComplete }: BatchProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [completedConversions, setCompletedConversions] = useState<ConvertedFile[]>([])
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false)
  const [conversionResults, setConversionResults] = useState<{
    [fileId: string]: {
      status: "completed" | "failed"
      error?: string
      convertedFiles?: ConvertedFile[]
    }
  }>({})

  const totalConversions = files.length * formats.length
  const completedCount = completedConversions.length

  // Reset completed conversions when files or formats change
  useEffect(() => {
    if (files.length === 0 || formats.length === 0) {
      setCompletedConversions([])
      setOverallProgress(0)
      setCurrentFile(null)
      setIsProcessing(false)
      setIsPaused(false)
      setHasStartedProcessing(false)
    }
  }, [files.length, formats.length])

  const startProcessing = async () => {
    if (files.length === 0 || formats.length === 0) return

    setIsProcessing(true)
    setIsPaused(false)
    setHasStartedProcessing(true)
    setCompletedConversions([]) // Clear previous conversions
    setConversionResults({}) // Clear previous results

    const updatedFiles = [...files]
    const results: typeof conversionResults = {}

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      if (isPaused) break

      const file = files[fileIndex]
      setCurrentFile(file.name)

      // Update file status to processing
      updatedFiles[fileIndex] = { ...file, status: "processing", progress: 0 }
      onFilesUpdate([...updatedFiles])

      const fileConversions: ConvertedFile[] = []
      let hasError = false

      for (let formatIndex = 0; formatIndex < formats.length; formatIndex++) {
        if (isPaused) break

        const format = formats[formatIndex]

        try {
          // Simulate conversion process
          for (let progress = 0; progress <= 100; progress += 25) {
            if (isPaused) break

            await new Promise((resolve) => setTimeout(resolve, 200))

            // Update file progress
            const fileProgress = Math.round((formatIndex * 100 + progress) / formats.length)
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              progress: fileProgress,
            }
            onFilesUpdate([...updatedFiles])

            // Update overall progress
            const totalProgress = ((fileIndex * formats.length + formatIndex) * 100 + progress) / totalConversions
            setOverallProgress(Math.round(totalProgress))
          }

          // Simulate random failure (10% chance)
          if (Math.random() < 0.1) {
            throw new Error(`Conversion to ${format.name} failed`)
          }

          // Create proper mock converted file
          const mockBlob = MockConverter.createMockFile(format, file.name)
          const convertedFile: ConvertedFile = {
            format,
            url: URL.createObjectURL(mockBlob),
            filename: `${file.name.replace(".pdf", "")}_converted${format.extension}`,
            size: mockBlob.size,
            downloadCount: 0,
          }

          fileConversions.push(convertedFile)
          setCompletedConversions((prev) => [...prev, convertedFile])
        } catch (error) {
          hasError = true
          console.error(`Conversion failed for ${file.name} to ${format.name}:`, error)
          break // Stop processing other formats for this file if one fails
        }
      }

      // Set conversion result for this file
      if (hasError) {
        results[file.id] = {
          status: "failed",
          error: "Conversion failed. Please try again.",
        }
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          status: "error",
          error: "Conversion failed",
        }
      } else {
        results[file.id] = {
          status: "completed",
          convertedFiles: fileConversions,
        }
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          status: "completed",
          progress: 100,
          convertedFiles: fileConversions,
        }
      }

      onFilesUpdate([...updatedFiles])
    }

    setConversionResults(results)
    setIsProcessing(false)
    setCurrentFile(null)
    setOverallProgress(100)

    // Notify parent that conversions are complete
    if (onConversionComplete) {
      onConversionComplete()
    }
  }

  const pauseProcessing = () => {
    setIsPaused(true)
    setIsProcessing(false)
  }

  const resumeProcessing = () => {
    setIsPaused(false)
    startProcessing()
  }

  const resetProcessing = () => {
    setIsProcessing(false)
    setIsPaused(false)
    setOverallProgress(0)
    setCurrentFile(null)
    setCompletedConversions([])
    setHasStartedProcessing(false)
    setConversionResults({}) // Add this line

    const resetFiles = files.map((file) => ({
      ...file,
      status: "pending" as const,
      progress: 0,
      error: undefined,
      convertedFiles: undefined,
    }))
    onFilesUpdate(resetFiles)
  }

  const downloadAll = () => {
    // Download all files individually (since we can't create a real ZIP)
    completedConversions.forEach((file, index) => {
      setTimeout(() => downloadSingle(file), index * 500) // Stagger downloads
    })
  }

  const downloadSingle = (convertedFile: ConvertedFile) => {
    try {
      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = convertedFile.url
      link.download = convertedFile.filename
      link.style.display = "none"

      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update download count
      setCompletedConversions((prev) =>
        prev.map((file) => (file === convertedFile ? { ...file, downloadCount: file.downloadCount + 1 } : file)),
      )

      console.log(`Downloaded: ${convertedFile.filename}`)
    } catch (error) {
      console.error("Download failed:", error)
      alert(`Download failed for ${convertedFile.filename}. Please try again.`)
    }
  }

  const retryConversion = async (fileId: string) => {
    const file = files.find((f) => f.id === fileId)
    if (!file) return

    // Reset this file's status
    const updatedFiles = files.map((f) =>
      f.id === fileId ? { ...f, status: "processing" as const, progress: 0, error: undefined } : f,
    )
    onFilesUpdate(updatedFiles)

    // Remove from results temporarily
    const newResults = { ...conversionResults }
    delete newResults[fileId]
    setConversionResults(newResults)

    setCurrentFile(file.name)

    const fileConversions: ConvertedFile[] = []
    let hasError = false

    for (let formatIndex = 0; formatIndex < formats.length; formatIndex++) {
      const format = formats[formatIndex]

      try {
        // Simulate conversion process
        for (let progress = 0; progress <= 100; progress += 25) {
          await new Promise((resolve) => setTimeout(resolve, 200))

          const fileProgress = Math.round((formatIndex * 100 + progress) / formats.length)
          const updatedFilesProgress = files.map((f) =>
            f.id === fileId ? { ...f, status: "processing" as const, progress: fileProgress } : f,
          )
          onFilesUpdate(updatedFilesProgress)
        }

        // Simulate random failure (5% chance for retry)
        if (Math.random() < 0.05) {
          throw new Error(`Retry conversion to ${format.name} failed`)
        }

        // Create proper mock converted file
        const mockBlob = MockConverter.createMockFile(format, file.name)
        const convertedFile: ConvertedFile = {
          format,
          url: URL.createObjectURL(mockBlob),
          filename: `${file.name.replace(".pdf", "")}_converted${format.extension}`,
          size: mockBlob.size,
          downloadCount: 0,
        }

        fileConversions.push(convertedFile)
        setCompletedConversions((prev) => [...prev, convertedFile])
      } catch (error) {
        hasError = true
        console.error(`Retry conversion failed for ${file.name} to ${format.name}:`, error)
        break
      }
    }

    // Update final result
    if (hasError) {
      setConversionResults((prev) => ({
        ...prev,
        [fileId]: {
          status: "failed",
          error: "Retry conversion failed. Please try again.",
        },
      }))
      const finalFiles = files.map((f) =>
        f.id === fileId ? { ...f, status: "error" as const, error: "Retry conversion failed" } : f,
      )
      onFilesUpdate(finalFiles)
    } else {
      setConversionResults((prev) => ({
        ...prev,
        [fileId]: {
          status: "completed",
          convertedFiles: fileConversions,
        },
      }))
      const finalFiles = files.map((f) =>
        f.id === fileId ? { ...f, status: "completed" as const, progress: 100, convertedFiles: fileConversions } : f,
      )
      onFilesUpdate(finalFiles)
    }

    setCurrentFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Show empty state if no files or formats
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Uploaded</h3>
          <p className="text-gray-600">Upload PDF files to get started with conversion</p>
        </CardContent>
      </Card>
    )
  }

  if (formats.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Output Formats Selected</h3>
          <p className="text-gray-600">Go back to Select Formats tab to choose output formats</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Batch Conversion
            <Badge variant="secondary">
              {files.length} files × {formats.length} formats = {totalConversions} conversions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {completedCount}/{totalConversions} completed
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Current Status */}
          {currentFile && isProcessing && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Currently processing: {currentFile}</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isProcessing && !isPaused ? (
              <Button onClick={startProcessing} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Conversion
              </Button>
            ) : isPaused ? (
              <Button onClick={resumeProcessing} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseProcessing} variant="outline" className="flex-1 bg-transparent">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            <Button onClick={resetProcessing} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>

            {completedConversions.length > 0 && (
              <Button onClick={downloadAll} variant="default">
                <Package className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Processing Status - Show when processing has started */}
      {hasStartedProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {file.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {file.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {file.status === "processing" && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {file.status === "pending" && <div className="w-5 h-5 bg-gray-300 rounded-full" />}

                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      file.status === "completed"
                        ? "default"
                        : file.status === "error"
                          ? "destructive"
                          : file.status === "processing"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {file.status}
                  </Badge>
                </div>

                {file.status === "processing" && (
                  <div className="mb-2">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{file.progress}% complete</p>
                  </div>
                )}

                {file.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {file.error}
                  </div>
                )}

                {/* Show converted formats for completed files */}
                {file.status === "completed" && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm font-medium">Converted to:</p>
                    <div className="space-y-2">
                      {formats.map((format) => {
                        // Find the corresponding converted file
                        const convertedFile = completedConversions.find(
                          (cf) => cf.format.id === format.id && cf.filename.includes(file.name.replace(".pdf", "")),
                        )

                        return (
                          <div key={format.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {format.icon} {format.name}
                              </Badge>
                              {convertedFile && (
                                <span className="text-xs text-gray-500">{formatFileSize(convertedFile.size)}</span>
                              )}
                            </div>
                            {convertedFile && (
                              <Button
                                onClick={() => downloadSingle(convertedFile)}
                                size="sm"
                                variant="outline"
                                className="h-8 px-3"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Download Section - Show if there are completed conversions */}
      {completedConversions.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Download Converted Files ({completedConversions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedConversions.map((convertedFile, index) => (
              <div
                key={`${convertedFile.filename}-${index}`}
                className="flex items-center justify-between p-3 bg-white border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{convertedFile.format.icon}</span>
                  <div>
                    <p className="font-medium">{convertedFile.filename}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(convertedFile.size)} • {convertedFile.format.name}
                      {convertedFile.downloadCount > 0 && (
                        <span className="ml-2 text-xs text-green-600">Downloaded {convertedFile.downloadCount}x</span>
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => downloadSingle(convertedFile)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}

            {/* Download All Button */}
            {completedConversions.length > 1 && (
              <div className="pt-3 border-t">
                <Button onClick={downloadAll} className="w-full bg-green-600 hover:bg-green-700">
                  <Package className="w-4 h-4 mr-2" />
                  Download All Files ({completedConversions.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversion Results Card - New card that appears after conversion */}
      {Object.keys(conversionResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => {
              const result = conversionResults[file.id]
              if (!result) return null

              return (
                <div
                  key={file.id}
                  className={`border rounded-lg p-4 ${
                    result.status === "completed" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.status === "completed" ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                        {result.status === "completed" && (
                          <p className="text-sm text-green-600">
                            Successfully converted to {formats.length} format{formats.length > 1 ? "s" : ""}
                          </p>
                        )}
                        {result.status === "failed" && <p className="text-sm text-red-600">{result.error}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={result.status === "completed" ? "default" : "destructive"}
                        className={result.status === "completed" ? "bg-green-600" : ""}
                      >
                        {result.status === "completed" ? "Complete" : "Failed"}
                      </Badge>

                      {result.status === "completed" && result.convertedFiles ? (
                        <div className="flex gap-2">
                          {result.convertedFiles.map((convertedFile, index) => (
                            <Button
                              key={index}
                              onClick={() => downloadSingle(convertedFile)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {convertedFile.format.name}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Button
                          onClick={() => retryConversion(file.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
