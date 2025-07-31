"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCache } from "@/hooks/use-cache"
import { Database, Trash2 } from "lucide-react"

export function CacheStatus() {
  const { getCacheInfo, clearCache } = useCache()
  const [cacheInfo, setCacheInfo] = useState({ size: "0 KB", supported: false, lastUpdated: 0 })

  useEffect(() => {
    setCacheInfo(getCacheInfo())
  }, [getCacheInfo])

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data? This will remove your upload history and settings.")) {
      clearCache()
      setCacheInfo(getCacheInfo())
      window.location.reload()
    }
  }

  const formatLastUpdated = (timestamp: number) => {
    if (timestamp === 0) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (!cacheInfo.supported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50 h-32 flex flex-col justify-center">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="flex items-center gap-3 text-center">
            <Database className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Cache not supported</p>
              <p className="text-xs text-yellow-600">Browser doesn't support local storage</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 h-32 flex flex-col justify-between">
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-blue-800">Cache Active</p>
                <Badge variant="outline" className="text-xs">
                  {cacheInfo.size}
                </Badge>
              </div>
              <p className="text-xs text-blue-600">Last updated: {formatLastUpdated(cacheInfo.lastUpdated)}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCache}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
