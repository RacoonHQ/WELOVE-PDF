"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ConversionFormat } from "@/app/page"

interface FormatSelectorProps {
  formats: ConversionFormat[]
  selectedFormat: ConversionFormat
  onFormatChange: (format: ConversionFormat) => void
}

export function FormatSelector({ formats, selectedFormat, onFormatChange }: FormatSelectorProps) {
  const categories = {
    document: formats.filter((f) => f.category === "document"),
    image: formats.filter((f) => f.category === "image"),
    other: formats.filter((f) => f.category === "other"),
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Choose Output Format</h3>

      {Object.entries(categories).map(([category, categoryFormats]) => (
        <div key={category}>
          <Badge variant="secondary" className="mb-2 capitalize">
            {category}
          </Badge>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryFormats.map((format) => (
              <Card
                key={format.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedFormat.id === format.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => onFormatChange(format)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {format.icon}
                    <div>
                      <p className="font-medium text-sm">{format.name}</p>
                      <p className="text-xs text-gray-500">{format.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
