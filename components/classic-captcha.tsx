"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface ClassicCaptchaProps {
  onSolved: () => void
}

type CaptchaImage = {
  id: number
  src: string
  alt: string
  correct: boolean
}

export default function ClassicCaptcha({ onSolved }: ClassicCaptchaProps) {
  const [images, setImages] = useState<CaptchaImage[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Use the provided images for the CAPTCHA
    const captchaImages: CaptchaImage[] = [
      {
        id: 1,
        src: "https://ik.imagekit.io/lapstjup/V0%20Captcha%20contest/Gemini_Generated_Image_u6tq80u6tq80u6tq.png",
        alt: "Handshake representing trust",
        correct: true, // This is the correct trust image
      },
      {
        id: 2,
        src: "https://ik.imagekit.io/lapstjup/V0%20Captcha%20contest/Gemini_Generated_Image_u6tq7xu6tq7xu6tq.png",
        alt: "Abstract image",
        correct: false,
      },
      {
        id: 3,
        src: "https://ik.imagekit.io/lapstjup/V0%20Captcha%20contest/Gemini_Generated_Image_u6tq7yu6tq7yu6tq.png?updatedAt=1749798404497",
        alt: "Abstract image",
        correct: false,
      },
      {
        id: 4,
        src: "https://ik.imagekit.io/lapstjup/V0%20Captcha%20contest/Gemini_Generated_Image_u6tq7zu6tq7zu6tq.png",
        alt: "Abstract image",
        correct: false,
      },
    ]

    // Shuffle the images
    setImages([...captchaImages].sort(() => Math.random() - 0.5))
  }, [])

  const handleImageClick = (id: number, correct: boolean) => {
    setSelected(id)
    setIsCorrect(correct)
  }

  const handleVerify = () => {
    if (isCorrect) {
      // Play the video if the global function exists
      if (typeof window !== "undefined" && window.playRickroll) {
        window.playRickroll()
      }

      // Call onSolved to proceed to the next step
      onSolved()
    } else {
      // Add shake animation
      setIsShaking(true)

      // Remove shake class after animation completes
      setTimeout(() => {
        setIsShaking(false)
      }, 500)

      // Reset selection if incorrect
      setSelected(null)
      setIsCorrect(null)
      // Shuffle images again
      setImages((prev) => [...prev].sort(() => Math.random() - 0.5))
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="retro-alert bg-yellow-100 border-yellow-500">
        <h3 className="text-xl font-bold text-center">
          Select the image that represents <span className="text-orange-500">trust</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`retro-card cursor-pointer transition-all ${
              selected === image.id ? "border-orange-500 border-4" : "hover:translate-y-[-2px]"
            }`}
            onClick={() => handleImageClick(image.id, image.correct)}
          >
            <div className="aspect-square relative">
              <img src={image.src || "/placeholder.svg"} alt={image.alt} className="object-cover w-full h-full" />
              {selected === image.id && (
                <div className="absolute inset-0 backdrop-blur-sm bg-yellow-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-orange-500" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        ref={buttonRef}
        onClick={handleVerify}
        disabled={selected === null}
        className={`retro-button w-full ${isShaking ? "shake" : ""}`}
      >
        Verify
      </Button>
    </div>
  )
}
