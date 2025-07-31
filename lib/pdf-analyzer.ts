export type PDFContentType = "text" | "image" | "table" | "mixed"

export class PDFAnalyzer {
  /**
   * Analyze PDF content to determine the primary content type
   * This is a mock implementation - in real app, you'd use PDF.js or similar
   */
  static async analyzePDFContent(file: File): Promise<PDFContentType> {
    try {
      // Validate input
      if (!file) {
        console.warn("PDFAnalyzer: File is undefined, defaulting to mixed")
        return "mixed"
      }

      if (!file.name) {
        console.warn("PDFAnalyzer: File name is undefined, defaulting to mixed")
        return "mixed"
      }

      if (typeof file.size !== "number") {
        console.warn("PDFAnalyzer: File size is invalid, defaulting to mixed")
        return "mixed"
      }

      // Mock analysis based on filename and size
      const filename = file.name.toLowerCase()
      const sizeInMB = file.size / (1024 * 1024)

      // Simulate analysis delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Mock logic based on filename patterns
      if (filename.includes("scan") || filename.includes("image") || filename.includes("photo")) {
        return "image"
      }

      if (
        filename.includes("table") ||
        filename.includes("data") ||
        filename.includes("report") ||
        filename.includes("excel")
      ) {
        return "table"
      }

      if (filename.includes("document") || filename.includes("text") || filename.includes("letter")) {
        return "text"
      }

      // Mock analysis based on file size
      if (sizeInMB > 10) {
        // Large files are likely image-heavy
        return Math.random() > 0.5 ? "image" : "mixed"
      } else if (sizeInMB < 1) {
        // Small files are likely text-only
        return "text"
      }

      // Random assignment for demo purposes
      const types: PDFContentType[] = ["text", "image", "table", "mixed"]
      const weights = [0.4, 0.2, 0.2, 0.2] // 40% text, 20% each for others

      const random = Math.random()
      let cumulative = 0

      for (let i = 0; i < types.length; i++) {
        cumulative += weights[i]
        if (random <= cumulative) {
          return types[i]
        }
      }

      return "mixed"
    } catch (error) {
      console.error("PDFAnalyzer: Error analyzing PDF content:", error)
      return "mixed"
    }
  }

  /**
   * Get content type description for UI
   */
  static getContentTypeDescription(contentType: PDFContentType): string {
    switch (contentType) {
      case "text":
        return "Text-heavy document with paragraphs and formatting"
      case "image":
        return "Image-heavy document with photos or scanned content"
      case "table":
        return "Data-heavy document with tables and structured information"
      case "mixed":
        return "Mixed content with text, images, and data"
      default:
        return "Unknown content type"
    }
  }

  /**
   * Get content type icon
   */
  static getContentTypeIcon(contentType: PDFContentType): string {
    switch (contentType) {
      case "text":
        return "📝"
      case "image":
        return "🖼️"
      case "table":
        return "📊"
      case "mixed":
        return "📄"
      default:
        return "📄"
    }
  }
}
