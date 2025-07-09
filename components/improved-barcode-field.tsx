"use client"

import { useState } from "react"
import { Copy, Download, RefreshCw, Barcode, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ControllerRenderProps, useFormContext } from "react-hook-form"

interface BarcodeFieldProps {
  field: any
}

export default function ImprovedBarcodeField({ field }: BarcodeFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const form = useFormContext()

  const generateBarcode = async () => {
    setIsGenerating(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const barcode = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")

    form.setValue("barcode", barcode)
    setIsGenerating(false)
  }

  const copyBarcode = async () => {
    if (field.value) {
      await navigator.clipboard.writeText(field.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadBarcode = async () => {
    if (!field.value) return

    setIsDownloading(true)
    try {
      const img = document.getElementById("barcode-img") as HTMLImageElement | null
      if (img) {
        const link = document.createElement("a")
        link.href = img.src
        link.download = `barcode-${field.value}.png`
        link.click()
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const validateBarcode = (value: string) => {
    return /^\d{12}$/.test(value)
  }

  const isValid = field.value ? validateBarcode(field.value) : true

  return (
    <FormItem className="space-y-4">
      <FormLabel className="flex items-center gap-2 text-base font-medium">
        <Barcode className="h-4 w-4" />
        Product Barcode
      </FormLabel>

      {/* Input Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <FormControl>
            <Input
              placeholder="Enter 12-digit barcode"
              className={`font-mono tracking-wider text-lg transition-colors ${
                field.value && !isValid ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              value={field.value}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 12)
                field.onChange(value)
              }}
              maxLength={12}
            />
          </FormControl>

          <Button
            type="button"
            variant="outline"
            onClick={generateBarcode}
            disabled={isGenerating}
            className="shrink-0 bg-transparent"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate
          </Button>
        </div>

        {/* Validation Badge */}
        {field.value && (
          <div className="flex items-center gap-2">
            <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
              {isValid ? "Valid EAN-13" : "Invalid format"}
            </Badge>
            <span className="text-xs text-muted-foreground">{field.value.length}/12 digits</span>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {field.value && isValid && (
        <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Barcode Preview</h4>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="ghost" onClick={copyBarcode} className="h-8 px-2">
                  {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Barcode Display */}
            <div className="space-y-4">
              {/* Text Display */}
              <div className="flex items-center justify-center">
                <div className="font-mono text-2xl tracking-[0.5em] bg-background rounded-lg px-4 py-3 border shadow-sm">
                  {field.value}
                </div>
              </div>

              {/* Barcode Image */}
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <img
                    id="barcode-img"
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                      field.value,
                    )}&code=EAN13&translate-esc=false&dpi=150`}
                    alt="EAN-13 Barcode"
                    className="h-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={downloadBarcode}
                  disabled={isDownloading}
                  className="gap-2 bg-transparent"
                >
                  {isDownloading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  Download PNG
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              EAN-13 format • Ready for printing and scanning
            </div>
          </CardContent>
        </Card>
      )}

      <FormMessage />
    </FormItem>
  )
}
