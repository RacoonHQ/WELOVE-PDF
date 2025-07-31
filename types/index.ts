export interface ConversionFormat {
  id: string
  name: string
  extension: string
  icon: string
  description: string
  category: "document" | "image" | "data" | "other"
  settings?: FormatSettings
  recommendationLevel?: "recommended" | "caution" | "not-suitable"
  suitableFor?: ("text" | "image" | "table" | "mixed")[]
  tooltip?: string
}

export interface FormatSettings {
  quality?: "low" | "medium" | "high" | "maximum"
  dpi?: number
  compression?: "none" | "low" | "medium" | "high"
  pageRange?: string
  ocrLanguage?: string
  preserveFonts?: boolean
  extractTables?: boolean
  colorSpace?: "rgb" | "cmyk" | "grayscale"
}

export interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  error?: string
  convertedFiles?: ConvertedFile[]
  contentType?: "text" | "image" | "table" | "mixed"
}

export interface ConvertedFile {
  format: ConversionFormat
  url: string
  filename: string
  size: number
  downloadCount: number
}

export interface ConversionPreset {
  id: string
  name: string
  description: string
  settings: FormatSettings
}

export interface ConversionHistory {
  id: string
  timestamp: Date
  originalFile: string
  formats: ConversionFormat[]
  settings: FormatSettings
  downloadUrls: string[]
}
