"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUploader } from "@/components/upload/file-uploader"
import { FormatSelector } from "@/components/converters/format-selector"
import { ConversionHistory } from "@/components/history/conversion-history"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { BatchProcessor } from "@/components/converters/batch-processor"
import { MobileNav } from "@/components/ui/mobile-nav"
import { CacheStatus } from "@/components/ui/cache-status"
import { UsageIndicator } from "@/components/ui/usage-indicator"
import { ProductTour, TourHighlight } from "@/components/tour/product-tour"
import { CONVERSION_FORMATS } from "@/lib/formats"
import { useCache } from "@/hooks/use-cache"
import { ConversionLimitManager } from "@/lib/conversion-limit"
import type {
  UploadedFile,
  ConversionFormat as ConversionFormatType,
  FormatSettings,
  ConversionHistory as ConversionHistoryType,
} from "@/types"
import {
  Shield,
  Download,
  ArrowRight,
  Star,
  Users,
  Clock,
  AlertTriangle,
  FileX,
  Settings,
  ArrowLeft,
} from "lucide-react"

export type ConversionFormat = ConversionFormatType

export default function WeLovePDF() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFormats, setSelectedFormats] = useState<ConversionFormat[]>([])
  const [conversionSettings, setConversionSettings] = useState<FormatSettings>({})
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedConversions, setHasCompletedConversions] = useState(false)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryType[]>([])
  const [showAlert, setShowAlert] = useState<{
    type: "files" | "formats" | "limit" | null
    show: boolean
    message?: string
  }>({
    type: null,
    show: false,
  })

  const { saveToCache, loadFromCache } = useCache()

  // Load cached data on mount
  useEffect(() => {
    const cachedData = loadFromCache()
    if (cachedData) {
      setUploadedFiles(cachedData.uploadedFiles || [])
      setSelectedFormats(cachedData.selectedFormats || [])
      setConversionSettings(cachedData.conversionSettings || {})
      setConversionHistory(cachedData.conversionHistory || [])
      // Check if there's any history to show history tab
      if (cachedData.conversionHistory && cachedData.conversionHistory.length > 0) {
        setHasCompletedConversions(true)
      }
    }
    setIsLoading(false)
  }, [loadFromCache])

  // Save to cache whenever data changes
  useEffect(() => {
    if (!isLoading) {
      saveToCache({
        uploadedFiles,
        selectedFormats,
        conversionSettings,
        conversionHistory,
      })
    }
  }, [uploadedFiles, selectedFormats, conversionSettings, conversionHistory, isLoading, saveToCache])

  // Clear conversion state when switching away from queue tab
  useEffect(() => {
    if (activeTab !== "queue") {
      // Reset file statuses to pending when leaving conversion tab
      setUploadedFiles((prevFiles) =>
        prevFiles.map((file) => ({
          ...file,
          status: "pending" as const,
          progress: 0,
          error: undefined,
          convertedFiles: undefined,
        })),
      )
    }
  }, [activeTab])

  const handleFilesUpload = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files
      .filter((file) => file && file.name) // Filter out invalid files
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        status: "pending",
        progress: 0,
      }))

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleClearAllFiles = useCallback(() => {
    if (confirm("Are you sure you want to remove all uploaded files?")) {
      setUploadedFiles([])
    }
  }, [])

  const handleFormatSelection = useCallback((formats: ConversionFormat[]) => {
    setSelectedFormats(formats)
  }, [])

  const handleSettingsChange = useCallback((settings: FormatSettings) => {
    setConversionSettings(settings)
  }, [])

  const showAlertMessage = useCallback((type: "files" | "formats" | "limit", message?: string) => {
    setShowAlert({ type, show: true, message })
    setTimeout(() => setShowAlert({ type: null, show: false }), 5000)
  }, [])

  const startConversion = useCallback(() => {
    // Validation checks with alerts
    if (uploadedFiles.length === 0) {
      showAlertMessage("files")
      setActiveTab("upload") // Navigate back to upload tab
      return
    }

    if (selectedFormats.length === 0) {
      showAlertMessage("formats")
      setActiveTab("convert") // Navigate back to format selection tab
      return
    }

    // Check daily conversion limit
    if (!ConversionLimitManager.canConvert()) {
      const timeUntilReset = ConversionLimitManager.getTimeUntilReset()
      showAlertMessage("limit", `Daily conversion limit reached! Limit resets in ${timeUntilReset}.`)
      return
    }

    // Increment usage count
    ConversionLimitManager.incrementUsage()
    setActiveTab("queue")
  }, [uploadedFiles, selectedFormats, showAlertMessage])

  const handleConversionComplete = useCallback(() => {
    setHasCompletedConversions(true)

    // Add to conversion history
    const newHistoryEntry: ConversionHistoryType = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      originalFile: uploadedFiles.map((f) => f.name).join(", "),
      formats: [...selectedFormats],
      settings: { ...conversionSettings },
      downloadUrls: selectedFormats.map((_, index) => `mock-url-${index}`),
    }

    setConversionHistory((prev) => [newHistoryEntry, ...prev])

    // Clear selected formats after conversion is complete
    setSelectedFormats([])
  }, [uploadedFiles, selectedFormats, conversionSettings])

  // Add this useEffect after the existing ones
  useEffect(() => {
    const handleNavigateToConversion = () => {
      startConversion()
    }

    window.addEventListener("navigate-to-conversion", handleNavigateToConversion)

    return () => {
      window.removeEventListener("navigate-to-conversion", handleNavigateToConversion)
    }
  }, [startConversion])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Product Tour */}
      <ProductTour />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Always visible */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative w-8 h-8 sm:w-12 sm:h-12">
                <Image src="/logo.png" alt="WELOVE PDF Logo" fill className="object-contain" priority />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  WELOVE PDF
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Smart Multi-Format Solution</p>
              </div>
            </div>

            {/* Desktop Navigation Info */}
            <div className="hidden lg:flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                Smart Recommendations
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                100% Secure
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                No Registration
              </Badge>
            </div>

            {/* Mobile Navigation */}
            <MobileNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              uploadedFilesCount={uploadedFiles.length}
              selectedFormatsCount={selectedFormats.length}
              showHistory={hasCompletedConversions}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alert Messages */}
        {showAlert.show && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <Alert
              className={`shadow-lg animate-in slide-in-from-top-2 duration-300 ${
                showAlert.type === "limit" ? "bg-red-50 border-red-200" : "bg-red-50 border-red-200"
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {showAlert.type === "files" && (
                  <div className="flex items-center gap-2">
                    <FileX className="w-4 h-4" />
                    <span>Please upload at least one PDF file before starting conversion.</span>
                  </div>
                )}
                {showAlert.type === "formats" && (
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Please select at least one output format before starting conversion.</span>
                  </div>
                )}
                {showAlert.type === "limit" && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{showAlert.message}</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        <TourHighlight id="hero-section">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
              Convert PDFs to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Any Format
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Smart format recommendations based on your PDF content. Get the best conversion results with our
              AI-powered analysis.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/60 rounded-xl">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Smart Recommendations</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/60 rounded-xl">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">100% Secure</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/60 rounded-xl">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Batch Processing</span>
              </div>
            </div>

            {/* Usage Indicator and Cache Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
              <TourHighlight id="usage-indicator">
                <UsageIndicator />
              </TourHighlight>
              <TourHighlight id="cache-status">
                <CacheStatus />
              </TourHighlight>
            </div>
          </div>
        </TourHighlight>

        {/* Main Application */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs - Improved styling */}
          <div className="hidden md:block">
            <div className="flex justify-center">
              <div
                className={`inline-flex bg-transparent border border-gray-200 rounded-xl p-1 ${
                  hasCompletedConversions ? "grid-cols-4" : "grid-cols-3"
                }`}
              >
                <TourHighlight id="upload-tab">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === "upload"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Upload Files
                    {uploadedFiles.length > 0 && (
                      <Badge
                        variant={activeTab === "upload" ? "secondary" : "outline"}
                        className={`ml-2 text-xs ${
                          activeTab === "upload" ? "bg-white/20 text-white border-white/30" : ""
                        }`}
                      >
                        {uploadedFiles.length}
                      </Badge>
                    )}
                  </button>
                </TourHighlight>
                <TourHighlight id="convert-tab">
                  <button
                    onClick={() => setActiveTab("convert")}
                    className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === "convert"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Select Formats
                    {selectedFormats.length > 0 && (
                      <Badge
                        variant={activeTab === "convert" ? "secondary" : "outline"}
                        className={`ml-2 text-xs ${
                          activeTab === "convert" ? "bg-white/20 text-white border-white/30" : ""
                        }`}
                      >
                        {selectedFormats.length}
                      </Badge>
                    )}
                  </button>
                </TourHighlight>
                <TourHighlight id="queue-tab">
                  <button
                    onClick={() => setActiveTab("queue")}
                    className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === "queue"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Conversion
                  </button>
                </TourHighlight>
                {hasCompletedConversions && (
                  <TourHighlight id="history-tab">
                    <button
                      onClick={() => setActiveTab("history")}
                      className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === "history"
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      History
                    </button>
                  </TourHighlight>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Progress Indicator with Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tabs = hasCompletedConversions
                    ? ["upload", "convert", "queue", "history"]
                    : ["upload", "convert", "queue"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1])
                  }
                }}
                disabled={activeTab === "upload"}
                className="p-2 h-8 w-8 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              {/* Progress Dots */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${activeTab === "upload" ? "bg-purple-600" : "bg-gray-300"}`}
                />
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${activeTab === "convert" ? "bg-purple-600" : "bg-gray-300"}`}
                />
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${activeTab === "queue" ? "bg-purple-600" : "bg-gray-300"}`}
                />
                {hasCompletedConversions && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <div
                      className={`w-3 h-3 rounded-full transition-colors ${activeTab === "history" ? "bg-purple-600" : "bg-gray-300"}`}
                    />
                  </>
                )}
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tabs = hasCompletedConversions
                    ? ["upload", "convert", "queue", "history"]
                    : ["upload", "convert", "queue"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1])
                  }
                }}
                disabled={activeTab === (hasCompletedConversions ? "history" : "queue")}
                className="p-2 h-8 w-8 rounded-full"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Tab Title */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === "upload" && "Upload PDF Files"}
                {activeTab === "convert" && "Select Output Formats"}
                {activeTab === "queue" && "Convert & Download"}
                {activeTab === "history" && "Conversion History"}
              </h3>
              <p className="text-sm text-gray-600">
                {activeTab === "upload" && "Step 1 of 3: Choose your PDF files"}
                {activeTab === "convert" && "Step 2 of 3: Pick your desired formats"}
                {activeTab === "queue" && "Step 3 of 3: Process and download"}
                {activeTab === "history" && "View your previous conversions"}
              </p>
            </div>
          </div>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl">Upload PDF Files</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Upload up to 10 PDF files (max 25MB each) for smart format recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFilesUpload={handleFilesUpload}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={(id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id))}
                  onClearAllFiles={handleClearAllFiles}
                />
              </CardContent>
            </Card>

            {uploadedFiles.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setActiveTab("convert")}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
                >
                  Continue to Smart Format Selection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Convert Tab */}
          <TabsContent value="convert" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FormatSelector
                  formats={CONVERSION_FORMATS}
                  selectedFormats={selectedFormats}
                  onFormatSelection={handleFormatSelection}
                  uploadedFiles={uploadedFiles}
                />
              </div>
              <div className="space-y-6">
                <SettingsPanel
                  selectedFormats={selectedFormats}
                  settings={conversionSettings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
            </div>

            {selectedFormats.length > 0 && (
              <div className="flex justify-center">
                <Button
                  onClick={startConversion}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full sm:w-auto"
                >
                  Start Conversion ({uploadedFiles.length} files → {selectedFormats.length} formats)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue">
            <BatchProcessor
              files={uploadedFiles}
              formats={selectedFormats}
              settings={conversionSettings}
              onFilesUpdate={setUploadedFiles}
              onConversionComplete={handleConversionComplete}
            />
          </TabsContent>

          {/* History Tab - Only show if conversions completed */}
          {hasCompletedConversions && (
            <TabsContent value="history">
              <ConversionHistory history={conversionHistory} />
            </TabsContent>
          )}
        </Tabs>

        {/* Format Categories Overview */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {["document", "image", "data", "other"].map((category) => {
            const categoryFormats = CONVERSION_FORMATS.filter((f) => f.category === category)
            const categoryNames = {
              document: "Documents",
              image: "Images",
              data: "Data",
              other: "Other",
            }

            return (
              <Card key={category} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 capitalize">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 sm:mb-4">{categoryFormats.length} formats available</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {categoryFormats.slice(0, 3).map((format) => (
                      <Badge key={format.id} variant="outline" className="text-xs">
                        {format.extension}
                      </Badge>
                    ))}
                    {categoryFormats.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{categoryFormats.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">1M+</h3>
            <p className="text-gray-600">Files Converted</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">4.9/5</h3>
            <p className="text-gray-600">User Rating</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Secure & Private</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative w-6 h-6">
                <Image src="/logo.png" alt="WELOVE PDF" fill className="object-contain" />
              </div>
              <span className="font-medium text-sm sm:text-base">Made with love for smart PDF conversion</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
              © 2025 WELOVE PDF. All conversions are processed locally in your browser for maximum privacy. Smart
              recommendations powered by <a href="https://github.com/RacoonHQ" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RacoonHQ</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
