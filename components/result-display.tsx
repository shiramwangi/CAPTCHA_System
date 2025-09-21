"use client"

import { CheckCircle, XCircle } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect } from "react"

interface ResultDisplayProps {
  isHuman: boolean
  titleRevealed?: boolean
}

export default function ResultDisplay({ isHuman, titleRevealed = false }: ResultDisplayProps) {
  useEffect(() => {
    // Trigger confetti if human verification is successful
    if (isHuman) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#facc15", "#ef4444"],
      })
    }
  }, [isHuman])

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-6 py-2 sm:py-4">
      <div className={`p-6 rounded-full border-4 border-black ${isHuman ? "bg-yellow-200" : "bg-red-200"}`}>
        {isHuman ? <div className="text-5xl">😄</div> : <div className="text-5xl">🤖</div>}
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">{isHuman ? "Verification Successful" : "Verification Failed"}</h3>

        <p className="text-gray-700">
          {isHuman
            ? "You're definitely human. Great taste in music."
            : "No reaction detected. Either a bot or a tough crowd."}
        </p>
      </div>

      <div className="retro-card w-full">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1 font-bold text-white text-center">
          {isHuman ? "HUMAN VERIFIED" : "VERIFICATION FAILED"}
        </div>
        <div className="p-4 flex items-center space-x-4">
          {isHuman ? (
            <div className="bg-green-200 p-2 rounded-full border-2 border-black">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            </div>
          ) : (
            <div className="bg-red-200 p-2 rounded-full border-2 border-black">
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            </div>
          )}
          <div>
            <p className="font-bold">{isHuman ? "Human Verified" : "Verification Failed"}</p>
            <p className="text-sm text-gray-700">
              {isHuman
                ? titleRevealed
                  ? "You smiled at a Rickroll. You're definitely human."
                  : "Your emotional response has been confirmed."
                : titleRevealed
                  ? "You didn't smile at a Rickroll. Are you even human?"
                  : "We couldn't detect a natural emotional response."}
            </p>
          </div>
        </div>
      </div>

      {isHuman && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-yellow-500 text-2xl">
                ★
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
