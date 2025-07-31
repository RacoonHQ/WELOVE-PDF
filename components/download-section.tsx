"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, RefreshCw, CheckCircle } from "lucide-react"
import type { ConversionFormat } from "@/app/page"

interface DownloadSectionProps {
  file: { url: string; filename: string }
  format: ConversionFormat
  onReset: () => void
}

export function DownloadSection({ file, format, onReset }: DownloadSectionProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-medium text-green-800">Conversion Complete!</h3>
            <p className="text-sm text-green-600">Your PDF has been successfully converted to {format.name}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-lg border mb-4">
          <div className="flex items-center gap-3">
            {format.icon}
            <div>
              <p className="font-medium">{file.filename}</p>
              <p className="text-sm text-gray-500">{format.name} format</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex-1" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download {format.extension.toUpperCase()}
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Convert Another
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
