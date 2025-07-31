"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ConversionLimitManager } from "@/lib/conversion-limit"
import { Clock, Zap, AlertTriangle } from "lucide-react"

export function UsageIndicator() {
  const [usageInfo, setUsageInfo] = useState({
    used: 0,
    remaining: 20,
    limit: 20,
    resetTime: new Date(),
  })
  const [timeUntilReset, setTimeUntilReset] = useState("")

  useEffect(() => {
    const updateUsage = () => {
      const info = ConversionLimitManager.getUsageInfo()
      setUsageInfo(info)
      setTimeUntilReset(ConversionLimitManager.getTimeUntilReset())
    }

    updateUsage()
    const interval = setInterval(updateUsage, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const usagePercentage = (usageInfo.used / usageInfo.limit) * 100
  const isNearLimit = usageInfo.remaining <= 5
  const isAtLimit = usageInfo.remaining === 0

  return (
    <Card
      className={`h-32 flex flex-col justify-between ${
        isAtLimit
          ? "border-red-200 bg-red-50"
          : isNearLimit
            ? "border-yellow-200 bg-yellow-50"
            : "border-green-200 bg-green-50"
      }`}
    >
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isAtLimit ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Zap className="w-5 h-5 text-blue-600" />}
            <span className="font-medium text-sm">Daily Conversions</span>
          </div>
          <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"} className="text-xs">
            {usageInfo.used}/{usageInfo.limit}
          </Badge>
        </div>

        <div className="space-y-2 flex-1">
          <Progress
            value={usagePercentage}
            className={`h-2 ${isAtLimit ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : "bg-green-100"}`}
          />

          <div className="flex items-center justify-between text-xs">
            <span className={isAtLimit ? "text-red-700" : isNearLimit ? "text-yellow-700" : "text-green-700"}>
              {usageInfo.remaining} conversions remaining
            </span>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Resets in {timeUntilReset}</span>
            </div>
          </div>
        </div>

        {/* Alert messages at bottom */}
        {isAtLimit && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
            <p className="font-medium">Daily limit reached!</p>
            <p>Limit resets in {timeUntilReset}.</p>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-800">
            <p>Approaching daily limit!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
