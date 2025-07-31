interface DailyUsage {
  date: string
  conversions: number
  lastReset: number
}

const DAILY_LIMIT = 20
const USAGE_KEY = "welove-pdf-daily-usage"

export class ConversionLimitManager {
  static getTodayString(): string {
    return new Date().toISOString().split("T")[0]
  }

  static getDailyUsage(): DailyUsage {
    try {
      const stored = localStorage.getItem(USAGE_KEY)
      if (!stored) {
        return this.createNewDailyUsage()
      }

      const usage: DailyUsage = JSON.parse(stored)
      const today = this.getTodayString()

      // Reset if it's a new day
      if (usage.date !== today) {
        return this.createNewDailyUsage()
      }

      return usage
    } catch (error) {
      console.warn("Failed to load daily usage:", error)
      return this.createNewDailyUsage()
    }
  }

  static createNewDailyUsage(): DailyUsage {
    const usage: DailyUsage = {
      date: this.getTodayString(),
      conversions: 0,
      lastReset: Date.now(),
    }
    this.saveDailyUsage(usage)
    return usage
  }

  static saveDailyUsage(usage: DailyUsage) {
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(usage))
    } catch (error) {
      console.warn("Failed to save daily usage:", error)
    }
  }

  static canConvert(): boolean {
    const usage = this.getDailyUsage()
    return usage.conversions < DAILY_LIMIT
  }

  static getRemainingConversions(): number {
    const usage = this.getDailyUsage()
    return Math.max(0, DAILY_LIMIT - usage.conversions)
  }

  static incrementUsage(): boolean {
    const usage = this.getDailyUsage()

    if (usage.conversions >= DAILY_LIMIT) {
      return false
    }

    usage.conversions += 1
    this.saveDailyUsage(usage)
    return true
  }

  static getUsageInfo() {
    const usage = this.getDailyUsage()
    return {
      used: usage.conversions,
      remaining: DAILY_LIMIT - usage.conversions,
      limit: DAILY_LIMIT,
      resetTime: this.getNextResetTime(),
    }
  }

  static getNextResetTime(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }

  static getTimeUntilReset(): string {
    const now = new Date()
    const resetTime = this.getNextResetTime()
    const diff = resetTime.getTime() - now.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
}
