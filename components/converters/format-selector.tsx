"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Star, AlertTriangle, X, Info, CheckCircle } from "lucide-react"
import type { ConversionFormat, UploadedFile } from "@/types"
import { PDFAnalyzer } from "@/lib/pdf-analyzer"

interface FormatSelectorProps {
  formats: ConversionFormat[]
  selectedFormats: ConversionFormat[]
  onFormatSelection: (formats: ConversionFormat[]) => void
  uploadedFiles: UploadedFile[]
}

export function FormatSelector({ formats, selectedFormats, onFormatSelection, uploadedFiles }: FormatSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("document")
  const [analyzedFiles, setAnalyzedFiles] = useState<UploadedFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze uploaded files when they change
  useEffect(() => {
    const analyzeFiles = async () => {
      if (uploadedFiles.length === 0) {
        setAnalyzedFiles([])
        return
      }

      setIsAnalyzing(true)

      try {
        const analyzed = await Promise.all(
          uploadedFiles.map(async (file) => {
            try {
              if (file.contentType) return file // Already analyzed

              // Validate file object
              if (!file.file) {
                console.warn("FormatSelector: File object is missing, skipping analysis for:", file.name)
                return { ...file, contentType: "mixed" as const }
              }

              const contentType = await PDFAnalyzer.analyzePDFContent(file.file)
              return { ...file, contentType }
            } catch (error) {
              console.error("FormatSelector: Error analyzing file:", file.name, error)
              return { ...file, contentType: "mixed" as const }
            }
          }),
        )

        setAnalyzedFiles(analyzed)
      } catch (error) {
        console.error("FormatSelector: Error in analyzeFiles:", error)
        // Fallback: set all files to mixed content type
        const fallbackFiles = uploadedFiles.map((file) => ({ ...file, contentType: "mixed" as const }))
        setAnalyzedFiles(fallbackFiles)
      } finally {
        setIsAnalyzing(false)
      }
    }

    analyzeFiles()
  }, [uploadedFiles])

  // Get primary content type from analyzed files
  const getPrimaryContentType = () => {
    if (analyzedFiles.length === 0) return "mixed"

    try {
      const contentTypes = analyzedFiles.map((f) => f.contentType || "mixed")
      const counts = contentTypes.reduce(
        (acc, type) => {
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const entries = Object.entries(counts)
      if (entries.length === 0) return "mixed"

      return entries.reduce((a, b) => (counts[a[0]] > counts[b[1]] ? a : b))[0]
    } catch (error) {
      console.error("FormatSelector: Error getting primary content type:", error)
      return "mixed"
    }
  }

  // Filter formats based on content type
  const getFilteredFormats = (categoryFormats: ConversionFormat[]) => {
    const primaryContentType = getPrimaryContentType()

    return categoryFormats
      .map((format) => {
        const isRecommendedForContent =
          format.suitableFor?.includes(primaryContentType as any) || format.suitableFor?.includes("mixed")

        // Determine the final recommendation level
        let finalRecommendationLevel = format.recommendationLevel || "caution"

        // If format is suitable for content and has recommended level, keep it as recommended
        // If format is suitable for content but has caution level, upgrade to recommended
        if (isRecommendedForContent && format.recommendationLevel === "recommended") {
          finalRecommendationLevel = "recommended"
        } else if (isRecommendedForContent && format.recommendationLevel === "caution") {
          finalRecommendationLevel = "recommended"
        } else if (!isRecommendedForContent) {
          finalRecommendationLevel = format.recommendationLevel || "caution"
        }

        return {
          ...format,
          isRecommendedForContent,
          finalRecommendationLevel,
          priority: finalRecommendationLevel === "recommended" ? 1 : finalRecommendationLevel === "caution" ? 2 : 3,
        }
      })
      .sort((a, b) => a.priority - b.priority)
  }

  const categories = {
    document: {
      name: "Documents",
      formats: getFilteredFormats(formats.filter((f) => f.category === "document")),
    },
    image: {
      name: "Images",
      formats: getFilteredFormats(formats.filter((f) => f.category === "image")),
    },
    data: {
      name: "Data",
      formats: getFilteredFormats(formats.filter((f) => f.category === "data")),
    },
    other: {
      name: "Other",
      formats: getFilteredFormats(formats.filter((f) => f.category === "other")),
    },
  }

  const toggleFormat = (format: ConversionFormat) => {
    const isSelected = selectedFormats.some((f) => f.id === format.id)
    if (isSelected) {
      onFormatSelection(selectedFormats.filter((f) => f.id !== format.id))
    } else {
      onFormatSelection([...selectedFormats, format])
    }
  }

  const selectAllInCategory = (categoryFormats: ConversionFormat[]) => {
    const newFormats = [...selectedFormats]
    categoryFormats.forEach((format) => {
      if (!newFormats.some((f) => f.id === format.id)) {
        newFormats.push(format)
      }
    })
    onFormatSelection(newFormats)
  }

  const clearAllInCategory = (categoryFormats: ConversionFormat[]) => {
    const formatIds = categoryFormats.map((f) => f.id)
    onFormatSelection(selectedFormats.filter((f) => !formatIds.includes(f.id)))
  }

  const getRecommendationBadge = (level: string, isRecommendedForContent: boolean) => {
    if (level === "recommended") {
      return {
        icon: <Star className="w-3 h-3 text-white" />,
        text: "Best Choice",
        className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm",
      }
    } else if (level === "caution") {
      return {
        icon: <AlertTriangle className="w-3 h-3 text-amber-700" />,
        text: "Use with Caution",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      }
    } else if (level === "not-suitable") {
      return {
        icon: <X className="w-3 h-3 text-red-700" />,
        text: "Not Recommended",
        className: "bg-red-50 text-red-700 border-red-200",
      }
    }

    return {
      icon: <CheckCircle className="w-3 h-3 text-gray-600" />,
      text: "Available",
      className: "bg-gray-50 text-gray-600 border-gray-200",
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Select Output Formats
            <Badge variant="secondary">{selectedFormats.length} selected</Badge>
          </CardTitle>

          {/* Content Analysis Results */}
          {analyzedFiles.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Info className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-900">Smart Analysis Results</span>
                {isAnalyzing && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="space-y-2">
                {analyzedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-2 bg-white/60 rounded-md">
                    <span className="text-lg">{PDFAnalyzer.getContentTypeIcon(file.contentType || "mixed")}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm text-blue-900">{file.name}</span>
                      <p className="text-xs text-blue-700">
                        {PDFAnalyzer.getContentTypeDescription(file.contentType || "mixed")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-4 overflow-x-auto">
              {Object.entries(categories).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="relative">
                  {category.name}
                  {selectedFormats.some((f) => f.category === key) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categories).map(([key, category]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{category.name} Formats</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => selectAllInCategory(category.formats)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => clearAllInCategory(category.formats)}>
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.formats.map((format) => {
                    const isSelected = selectedFormats.some((f) => f.id === format.id)
                    const extendedFormat = format as any
                    const recommendationBadge = getRecommendationBadge(
                      extendedFormat.finalRecommendationLevel,
                      extendedFormat.isRecommendedForContent,
                    )

                    return (
                      <Tooltip key={format.id}>
                        <TooltipTrigger asChild>
                          <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                              isSelected
                                ? "ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md"
                                : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-200"
                            } ${
                              extendedFormat.finalRecommendationLevel === "recommended"
                                ? "border-green-300 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                                : ""
                            }`}
                            onClick={() => toggleFormat(format)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Header with icon and title */}
                                <div className="flex items-start gap-3">
                                  <div className="text-2xl flex-shrink-0">{format.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold text-sm truncate">{format.name}</h4>
                                      <Badge
                                        variant={isSelected ? "default" : "outline"}
                                        className={`text-xs flex-shrink-0 ${isSelected ? "bg-blue-600" : ""}`}
                                      >
                                        {format.extension}
                                      </Badge>
                                    </div>

                                    {/* Single Recommendation Badge */}
                                    <div className="mb-2">
                                      <Badge className={`text-xs font-medium ${recommendationBadge.className}`}>
                                        <div className="flex items-center gap-1">
                                          {recommendationBadge.icon}
                                          <span>{recommendationBadge.text}</span>
                                        </div>
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Description */}
                                <div>
                                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {format.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{format.name}</p>
                            <p className="text-xs">{format.tooltip || format.description}</p>
                            {extendedFormat.finalRecommendationLevel === "recommended" && (
                              <p className="text-xs text-green-600 font-medium">✨ Perfect for your content type!</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Selected Formats Summary */}
          {selectedFormats.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Selected Formats ({selectedFormats.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFormats.map((format) => (
                  <Badge key={format.id} variant="default" className="bg-blue-600 hover:bg-blue-700">
                    <span className="mr-1">{format.icon}</span>
                    {format.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
