"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { ConversionFormat, FormatSettings } from "@/types"
import { CONVERSION_PRESETS } from "@/lib/formats"
import { Settings, Zap, Award, Smartphone, Gauge } from "lucide-react"

interface SettingsPanelProps {
  selectedFormats: ConversionFormat[]
  settings: FormatSettings
  onSettingsChange: (settings: FormatSettings) => void
}

export function SettingsPanel({ selectedFormats, settings, onSettingsChange }: SettingsPanelProps) {
  const updateSetting = (key: keyof FormatSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const applyPreset = (presetId: string) => {
    const preset = CONVERSION_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      onSettingsChange(preset.settings)
      // Auto navigate to conversion after preset selection
      setTimeout(() => {
        const event = new CustomEvent("navigate-to-conversion")
        window.dispatchEvent(event)
      }, 300)
    }
  }

  const hasImageFormats = selectedFormats.some((f) => f.category === "image")
  const hasDocumentFormats = selectedFormats.some((f) => f.category === "document")
  const hasDataFormats = selectedFormats.some((f) => f.category === "data")

  if (selectedFormats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Conversion Settings</h3>
          <p className="text-sm text-gray-600">Select output formats to configure conversion settings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CONVERSION_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              className="w-full justify-start h-auto p-4 bg-transparent hover:bg-gray-100 hover:shadow-md transition-all duration-200 border-2 hover:border-gray-300"
              onClick={() => applyPreset(preset.id)}
            >
              <div className="flex items-center gap-3">
                {preset.id === "best-quality" && <Award className="w-5 h-5 text-yellow-500" />}
                {preset.id === "balanced" && <Gauge className="w-5 h-5 text-blue-500" />}
                {preset.id === "fast" && <Zap className="w-5 h-5 text-green-500" />}
                {preset.id === "mobile" && <Smartphone className="w-5 h-5 text-purple-500" />}
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-gray-600">{preset.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quality Settings */}
          {hasImageFormats && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Image Quality</Label>
                <Select value={settings.quality || "high"} onValueChange={(value) => updateSetting("quality", value)}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Smaller files)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Better quality)</SelectItem>
                    <SelectItem value="maximum">Maximum (Best quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">DPI Resolution: {settings.dpi || 300}</Label>
                <Slider
                  value={[settings.dpi || 300]}
                  onValueChange={([value]) => updateSetting("dpi", value)}
                  min={72}
                  max={600}
                  step={24}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>72 (Web)</span>
                  <span>300 (Print)</span>
                  <span>600 (High-res)</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Compression</Label>
                <Select
                  value={settings.compression || "medium"}
                  onValueChange={(value) => updateSetting("compression", value)}
                >
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Largest files)</SelectItem>
                    <SelectItem value="low">Low compression</SelectItem>
                    <SelectItem value="medium">Medium compression</SelectItem>
                    <SelectItem value="high">High compression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Document Settings */}
          {hasDocumentFormats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preserve Fonts</Label>
                <Switch
                  checked={settings.preserveFonts ?? true}
                  onCheckedChange={(checked) => updateSetting("preserveFonts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Extract Tables</Label>
                <Switch
                  checked={settings.extractTables ?? true}
                  onCheckedChange={(checked) => updateSetting("extractTables", checked)}
                />
              </div>
            </div>
          )}

          {/* Page Range */}
          <div>
            <Label className="text-sm font-medium">Page Range (optional)</Label>
            <Input
              placeholder="e.g., 1-5, 8, 10-12"
              value={settings.pageRange || ""}
              onChange={(e) => updateSetting("pageRange", e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to convert all pages</p>
          </div>

          {/* OCR Language */}
          <div>
            <Label className="text-sm font-medium">OCR Language</Label>
            <Select
              value={settings.ocrLanguage || "eng"}
              onValueChange={(value) => updateSetting("ocrLanguage", value)}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="ind">Indonesian</SelectItem>
                <SelectItem value="spa">Spanish</SelectItem>
                <SelectItem value="fra">French</SelectItem>
                <SelectItem value="deu">German</SelectItem>
                <SelectItem value="chi_sim">Chinese (Simplified)</SelectItem>
                <SelectItem value="jpn">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selected Formats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedFormats.map((format) => (
              <Badge key={format.id} variant="secondary" className="text-xs md:text-sm">
                {format.icon} {format.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
