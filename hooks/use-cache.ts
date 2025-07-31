"use client"

import { useCallback } from "react"
import { CacheManager } from "@/lib/cache"
import type { UploadedFile, ConversionFormat, FormatSettings, ConversionHistory } from "@/types"

export function useCache() {
  const saveToCache = useCallback(
    (data: {
      uploadedFiles?: UploadedFile[]
      selectedFormats?: ConversionFormat[]
      conversionSettings?: FormatSettings
      conversionHistory?: ConversionHistory[]
    }) => {
      CacheManager.save(data)
    },
    [],
  )

  const loadFromCache = useCallback(() => {
    return CacheManager.load()
  }, [])

  const clearCache = useCallback(() => {
    CacheManager.clear()
  }, [])

  const getCacheInfo = useCallback(() => {
    return {
      size: CacheManager.getCacheSize(),
      supported: CacheManager.isSupported(),
      lastUpdated: CacheManager.load().lastUpdated,
    }
  }, [])

  return {
    saveToCache,
    loadFromCache,
    clearCache,
    getCacheInfo,
  }
}
