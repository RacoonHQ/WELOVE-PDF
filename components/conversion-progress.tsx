"use client"

import { Progress } from "@/components/ui/progress"
import type { ConversionFormat } from "@/app/page"

interface ConversionProgressProps {
  progress: number
  format: ConversionFormat
}

export function ConversionProgress({ progress, format }: ConversionProgressProps) {
  const getProgressMessage = () => {
    if (progress < 30) return "Analyzing PDF structure..."
    if (progress < 60) return "Extracting content..."
    if (progress < 90) return `Converting to ${format.name}...`
    return "Finalizing conversion..."
  }

  return (
    <div className="space-y-4 p-6 bg-blue-50 rounded-lg border">
      <div className="flex items-center gap-3">
        {format.icon}
        <div>
          <h3 className="font-medium">Converting to {format.name}</h3>
          <p className="text-sm text-gray-600">{getProgressMessage()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-500 text-center">{progress}% complete</p>
      </div>
    </div>
  )
}
