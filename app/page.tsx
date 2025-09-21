"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import CameraPermission from "@/components/camera-permission"
import ClassicCaptcha from "@/components/classic-captcha"
import RickrollVideo from "@/components/rickroll-video"
import ResultDisplay from "@/components/result-display"
import { X, Minus, Maximize2 } from "lucide-react"

export default function Home() {
  const [step, setStep] = useState<"camera" | "captcha" | "rickroll" | "result">("camera")
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [captchaSolved, setCaptchaSolved] = useState(false)
  const [isHuman, setIsHuman] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [titleRevealed, setTitleRevealed] = useState(false)
  const shouldPlayVideoRef = useRef(false)
  const [attemptCount, setAttemptCount] = useState(0) // Keep track of attempts

  useEffect(() => {
    // Update progress based on current step
    if (step === "camera") setProgress(0)
    else if (step === "captcha") setProgress(33)
    else if (step === "rickroll") {
      setProgress(66)
      // Reveal the true nature of the CAPTCHA
      setTimeout(() => {
        setTitleRevealed(true)
      }, 500) // Small delay for dramatic effect
    } else if (step === "result") setProgress(100)
  }, [step])

  const handleCameraPermission = (granted: boolean) => {
    console.log("Camera permission:", granted ? "granted" : "denied")
    setCameraPermission(granted)
    if (granted) {
      setStep("captcha")
    }
  }

  const handleCaptchaSolved = () => {
    console.log("CAPTCHA solved successfully")
    shouldPlayVideoRef.current = true
    setCaptchaSolved(true)
    setStep("rickroll")
  }

  const handleSmileDetected = (smiled: boolean) => {
    console.log("Smile detection result:", smiled ? "smiled" : "no smile detected")
    setIsHuman(smiled)
    setStep("result")
  }

  // Update the resetCaptcha function to ensure the video doesn't play again automatically
  const resetCaptcha = () => {
    // Only proceed if verification failed (isHuman is false)
    // This ensures we never reset after a successful verification
    if (isHuman === false) {
      // Stop and reset the video if the stopRickroll function exists
      if (typeof window !== "undefined" && window.stopRickroll) {
        window.stopRickroll()
      }

      // Reset all state
      setStep("camera")
      setCameraPermission(null)
      setCaptchaSolved(false)
      setIsHuman(null)
      setTitleRevealed(false)
      shouldPlayVideoRef.current = false // Make sure this is set to false

      // Increment attempt count to trigger reset in RickrollVideo
      setAttemptCount((prev) => prev + 1)
    }
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-2 sm:p-4 bg-sky-400 retro-grid overflow-hidden">
      <div className="max-w-md w-full relative">
        {/* Decorative elements */}
        <div className="absolute hidden sm:block -top-4 -left-4 w-16 h-16 text-yellow-400">
          <div className="absolute w-16 h-16 animate-pulse">✨</div>
        </div>
        <div className="absolute hidden sm:block -bottom-12 -right-12 w-12 h-12 text-yellow-400">
          <div className="absolute w-12 h-12 animate-pulse delay-300">✨</div>
        </div>

        {/* Main window */}
        <div className="retro-window shadow-xl">
          <div className="retro-window-header">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-center font-bold text-white">
              {titleRevealed ? (
                <>
                  <span className="line-through opacity-50">Emotion</span>{" "}
                  <span className="text-yellow-300 animate-pulse">Rickroll</span> CAPTCHA
                </>
              ) : (
                "Emotion CAPTCHA"
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Minus className="w-4 h-4 text-white" />
              <Maximize2 className="w-4 h-4 text-white" />
              <X className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="retro-window-content">
            <Progress value={progress} className="h-2 mb-4" />

            <div className="p-4">
              {step === "camera" && <CameraPermission onPermissionChange={handleCameraPermission} />}
              {step === "captcha" && cameraPermission && <ClassicCaptcha onSolved={handleCaptchaSolved} />}

              {/* Always render RickrollVideo but keep it hidden until needed */}
              <RickrollVideo
                onSmileDetected={handleSmileDetected}
                shouldPlayOnMount={shouldPlayVideoRef.current}
                isVisible={step === "rickroll"}
                attemptCount={attemptCount}
              />

              {step === "result" && isHuman !== null && <ResultDisplay isHuman={isHuman} titleRevealed={true} />}
            </div>

            <div className="flex justify-center p-4">
              {step === "result" && isHuman === false && (
                <Button onClick={resetCaptcha} className="retro-button">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
