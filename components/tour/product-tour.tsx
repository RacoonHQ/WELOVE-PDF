"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  highlight?: boolean
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to WELOVE PDF! 🎉",
    description:
      "Transform your PDF documents into 15+ different formats with advanced features. Let's take a quick tour!",
    target: "hero-section",
    position: "bottom",
    highlight: true,
  },
  {
    id: "upload",
    title: "Step 1: Upload Your Files",
    description:
      "Start by uploading your PDF files. You can drag & drop or click to browse. Maximum 10 files, 25MB each.",
    target: "upload-tab",
    position: "bottom",
  },
  {
    id: "formats",
    title: "Step 2: Choose Output Formats",
    description:
      "Select from 15+ formats including Word, Excel, PowerPoint, images, and more. You can select multiple formats!",
    target: "convert-tab",
    position: "bottom",
  },
  {
    id: "conversion",
    title: "Step 3: Start Conversion",
    description: "Monitor your conversion progress and download the results. All processing happens in your browser!",
    target: "queue-tab",
    position: "bottom",
  },
  {
    id: "usage",
    title: "Daily Usage Limit",
    description: "You get 20 free conversions per day. Track your usage with this indicator that resets daily.",
    target: "usage-indicator",
    position: "top",
  },
  {
    id: "cache",
    title: "Smart Caching",
    description:
      "Your files and settings are automatically saved locally for convenience. No data leaves your browser!",
    target: "cache-status",
    position: "top",
  },
  {
    id: "history",
    title: "Conversion History",
    description:
      "Access your previous conversions and re-download files anytime. History is saved locally on your device.",
    target: "history-tab",
    position: "bottom",
  },
]

const TOUR_STORAGE_KEY = "welove-pdf-tour-completed"

export function ProductTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has completed the tour
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!tourCompleted) {
      // Show tour after a short delay
      setTimeout(() => {
        setIsActive(true)
        setIsVisible(true)
      }, 1000)
    }
  }, [])

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const completeTour = () => {
    setIsActive(false)
    setIsVisible(false)
    localStorage.setItem(TOUR_STORAGE_KEY, "true")
  }

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY)
    setCurrentStep(0)
    setIsActive(true)
    setIsVisible(true)
  }

  // Add global function to reset tour (for testing)
  useEffect(() => {
    ;(window as any).resetProductTour = resetTour
  }, [])

  if (!isActive || !isVisible) return null

  const currentTourStep = TOUR_STEPS[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" />

      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <Card className="shadow-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1} of {TOUR_STEPS.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={skipTour}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentTourStep.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{currentTourStep.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={skipTour} className="text-gray-500">
                    Skip Tour
                  </Button>
                  <Button
                    onClick={nextStep}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlight specific elements */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.3), 0 0 20px rgba(147, 51, 234, 0.2);
          border-radius: 8px;
        }
      `}</style>
    </>
  )
}

// Helper component to add tour highlights
export function TourHighlight({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="tour-target">
      {children}
    </div>
  )
}
