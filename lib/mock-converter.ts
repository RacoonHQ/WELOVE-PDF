// Mock file converter that creates proper file formats
export class MockConverter {
  static createMockDocxFile(originalName: string, content = "Sample converted document"): Blob {
    // Create a simple mock DOCX structure (minimal ZIP with proper MIME type)
    const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Converted from: ${originalName}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${content}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>This is a mock conversion for demonstration purposes.</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`

    return new Blob([docxContent], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
  }

  static createMockExcelFile(originalName: string): Blob {
    const xlsxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>Converted from: ${originalName}</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>Sample Data 1</t></is></c>
      <c r="B2" t="inlineStr"><is><t>Sample Data 2</t></is></c>
    </row>
  </sheetData>
</worksheet>`

    return new Blob([xlsxContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }

  static createMockImageFile(originalName: string, format: string): Blob {
    // Create a simple 1x1 pixel image in base64
    let imageData: string
    let mimeType: string

    switch (format.toLowerCase()) {
      case "jpg":
      case "jpeg":
        // 1x1 red pixel JPEG
        imageData =
          "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        mimeType = "image/jpeg"
        break
      case "png":
        // 1x1 transparent pixel PNG
        imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        mimeType = "image/png"
        break
      default:
        imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        mimeType = "image/png"
    }

    const binaryString = atob(imageData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new Blob([bytes], { type: mimeType })
  }

  static createMockTextFile(originalName: string, content = "Sample converted text"): Blob {
    const textContent = `Converted from: ${originalName}

${content}

This is a mock conversion for demonstration purposes.
The original PDF content would appear here in a real conversion.`

    return new Blob([textContent], { type: "text/plain" })
  }

  static createMockFile(format: any, originalName: string): Blob {
    switch (format.id) {
      case "docx":
        return this.createMockDocxFile(originalName)
      case "xlsx":
        return this.createMockExcelFile(originalName)
      case "jpg":
      case "jpeg":
        return this.createMockImageFile(originalName, "jpg")
      case "png":
        return this.createMockImageFile(originalName, "png")
      case "txt":
        return this.createMockTextFile(originalName)
      default:
        return this.createMockTextFile(originalName, `Mock ${format.name} content`)
    }
  }
}
