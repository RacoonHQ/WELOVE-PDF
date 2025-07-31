"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, X, Upload, Settings, History, Info, CheckCircle, Star } from "lucide-react"
import Image from "next/image"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  uploadedFilesCount: number
  selectedFormatsCount: number
  showHistory?: boolean
}

export function MobileNav({
  activeTab,
  onTabChange,
  uploadedFilesCount,
  selectedFormatsCount,
  showHistory = false,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const baseNavItems = [
    {
      id: "upload",
      label: "Upload Files",
      icon: Upload,
      badge: uploadedFilesCount > 0 ? uploadedFilesCount : undefined,
      description: "Add your PDF files",
      step: 1,
    },
    {
      id: "convert",
      label: "Select Formats",
      icon: Settings,
      badge: selectedFormatsCount > 0 ? selectedFormatsCount : undefined,
      description: "Choose output formats",
      step: 2,
    },
    {
      id: "queue",
      label: "Conversion",
      icon: Info,
      description: "Process & download",
      step: 3,
    },
  ]

  const navItems = showHistory
    ? [
        ...baseNavItems,
        {
          id: "history",
          label: "History",
          icon: History,
          description: "Previous conversions",
          step: 4,
        },
      ]
    : baseNavItems

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  const getStepStatus = (item: any) => {
    if (item.id === activeTab) return "active"
    if (item.id === "upload" && uploadedFilesCount > 0) return "completed"
    if (item.id === "convert" && selectedFormatsCount > 0) return "completed"
    return "pending"
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-2 hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 bg-white">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-white/20 rounded-xl p-2">
                  <Image src="/logo.png" alt="WELOVE PDF" fill className="object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">WELOVE PDF</h2>
                  <p className="text-sm text-purple-100">Smart Converter</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">
                Step {navItems.findIndex((item) => item.id === activeTab) + 1} of {navItems.length}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{
                  width: `${((navItems.findIndex((item) => item.id === activeTab) + 1) / navItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4">
          <div className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const status = getStepStatus(item)
              const isActive = status === "active"
              const isCompleted = status === "completed"

              return (
                <div key={item.id} className="relative">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-sm"
                        : "hover:bg-gray-50 border-2 border-transparent"
                    }`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <div className="flex items-center gap-4 w-full">
                      {/* Step Number & Icon */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                              : isCompleted
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isCompleted && !isActive ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        {/* Step Number Badge */}
                        <div
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                            isActive
                              ? "bg-white text-purple-600 shadow-sm"
                              : isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {item.step}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <div className={`font-semibold text-sm ${isActive ? "text-purple-900" : "text-gray-900"}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs ${isActive ? "text-purple-600" : "text-gray-500"}`}>
                          {item.description}
                        </div>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={`text-xs font-medium ${
                            isActive ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Enhanced Quick Stats */}
          <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Files uploaded</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">{uploadedFilesCount}</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Formats selected</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">{selectedFormatsCount}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-sm text-gray-600">Total conversions</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-purple-600">{uploadedFilesCount * selectedFormatsCount}</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Made with ❤️ for smart PDF conversion</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
