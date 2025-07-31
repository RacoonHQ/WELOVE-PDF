interface CacheData {
  uploadedFiles: any[]
  selectedFormats: any[]
  conversionSettings: any
  conversionHistory: any[]
  lastUpdated: number
}

const CACHE_KEY = "welove-pdf-cache"
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

export class CacheManager {
  static save(data: Partial<CacheData>) {
    try {
      const existing = this.load()
      const updated = {
        ...existing,
        ...data,
        lastUpdated: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated, this.dateReplacer))
    } catch (error) {
      console.warn("Failed to save to cache:", error)
    }
  }

  static load(): CacheData {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return this.getDefaultData()

      const data = JSON.parse(cached, this.dateReviver)

      // Check if cache is expired
      if (Date.now() - data.lastUpdated > CACHE_EXPIRY) {
        this.clear()
        return this.getDefaultData()
      }

      return data
    } catch (error) {
      console.warn("Failed to load from cache:", error)
      return this.getDefaultData()
    }
  }

  static clear() {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.warn("Failed to clear cache:", error)
    }
  }

  static getDefaultData(): CacheData {
    return {
      uploadedFiles: [],
      selectedFormats: [],
      conversionSettings: {},
      conversionHistory: [],
      lastUpdated: Date.now(),
    }
  }

  static getCacheSize(): string {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return "0 KB"

      const sizeInBytes = new Blob([cached]).size
      const sizeInKB = (sizeInBytes / 1024).toFixed(2)
      return `${sizeInKB} KB`
    } catch (error) {
      return "0 KB"
    }
  }

  static isSupported(): boolean {
    try {
      const test = "__cache_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  // Helper function to serialize dates
  static dateReplacer(key: string, value: any) {
    if (key === "timestamp" && value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  }

  // Helper function to deserialize dates
  static dateReviver(key: string, value: any) {
    if (value && typeof value === "object" && value.__type === "Date") {
      return new Date(value.value)
    }
    return value
  }
}
