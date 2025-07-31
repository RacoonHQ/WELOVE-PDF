"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { MockConverter } from "@/lib/mock-converter"
import type { ConversionHistory as ConversionHistoryType } from "@/types"
import { Download, Search, Calendar, FileText, Clock, Settings } from "lucide-react"

interface ConversionHistoryProps {
  history: ConversionHistoryType[]
}

export function ConversionHistory({ history }: ConversionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<ConversionHistoryType[]>([])

  useEffect(() => {
    const filtered = history.filter(
      (item) =>
        item.originalFile.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.formats.some((format) => format.name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredHistory(filtered)
  }, [searchTerm, history])

  const formatDate = (timestamp: Date | string | number) => {
    // Ensure we have a proper Date object
    const date = new Date(timestamp)

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Unknown date"
    }

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const downloadFile = (format: any, originalFilename: string) => {
    try {
      // Create a proper mock file for re-download
      const mockBlob = MockConverter.createMockFile(format, originalFilename)
      const url = URL.createObjectURL(mockBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${originalFilename.replace(".pdf", "")}_converted${format.extension}`
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error("Re-download failed:", error)
      alert("Re-download failed. Please try again.")
    }
  }

  const truncateFileName = (fileName: string, maxLength = 25) => {
    if (fileName.length <= maxLength) return fileName
    const extension = fileName.split(".").pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."))
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4) + "..."
    return `${truncatedName}.${extension}`
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">Conversion History</h2>
                <p className="text-sm text-blue-600">Your previous conversions</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {history.length} conversions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversion history</h3>
            <p className="text-gray-600">
              {searchTerm ? "No conversions match your search." : "Your conversion history will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* File Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate" title={item.originalFile}>
                          {truncateFileName(item.originalFile)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Re-download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(item.formats[0], item.originalFile)}
                      className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Re-download
                    </Button>
                  </div>

                  {/* Converted Formats */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span>Converted to:</span>
                      <Badge variant="outline" className="text-xs">
                        {item.formats.length} format{item.formats.length > 1 ? "s" : ""}
                      </Badge>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.formats.map((format) => (
                        <Badge key={format.id} variant="secondary" className="bg-green-100 text-green-800">
                          <span className="mr-1">{format.icon}</span>
                          {format.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Settings Summary */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Conversion Settings</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(item.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
