"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface CameraPermissionProps {
  onPermissionChange: (granted: boolean) => void
}

export default function CameraPermission({ onPermissionChange }: CameraPermissionProps) {
  const [error, setError] = useState<string | null>(null)

  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera permission...")
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Stop all tracks immediately - we just needed the permission
      stream.getTracks().forEach((track) => track.stop())

      console.log("Camera permission granted")
      onPermissionChange(true)
    } catch (err) {
      console.error("Camera permission denied:", err)
      setError("Camera access is required to verify you're not emotionally robotic.")
      onPermissionChange(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-6 text-center">
      <div className="p-4 bg-yellow-200 rounded-full border-2 border-black">
        <Camera className="h-12 w-12 text-orange-500" />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Camera Access Required</h3>
        <p className="text-gray-700">
          This CAPTCHA needs to see your face to verify you're human. All processing happens locally - no images are
          uploaded.
        </p>
      </div>

      {error && (
        <div className="retro-alert bg-red-100 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <Button onClick={requestCameraPermission} className="retro-button w-full" size="lg">
        Grant Camera Access
      </Button>
    </div>
  )
}
