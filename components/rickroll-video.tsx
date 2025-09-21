"use client"

import { useState, useEffect, useRef } from "react"
import * as faceapi from "face-api.js"

interface RickrollVideoProps {
  onSmileDetected: (smiled: boolean) => void
  shouldPlayOnMount?: boolean
  isVisible?: boolean
  attemptCount?: number
}

// Define YouTube Player interface
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  getPlayerState: () => number
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void
            onStateChange?: (event: { data: number }) => void
          }
        },
      ) => YouTubePlayer
    }
    onYouTubeIframeAPIReady: () => void
    playRickroll: () => void
    stopRickroll: () => void
  }
}

export default function RickrollVideo({
  onSmileDetected,
  shouldPlayOnMount = false,
  isVisible = false,
  attemptCount = 0,
}: RickrollVideoProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState("Initializing...")
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [happinessScore, setHappinessScore] = useState(0)
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null)
  const [ytApiReady, setYtApiReady] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const hasPlayedRef = useRef(false)
  const hasCalledCallbackRef = useRef(false)
  const lastAttemptCountRef = useRef(attemptCount)
  const smileDetectedRef = useRef(false)

  // Reset detection state when attemptCount changes
  useEffect(() => {
    // Skip if this is the first render or if a smile was already detected
    if (lastAttemptCountRef.current === attemptCount || smileDetectedRef.current) {
      return
    }

    // Update the last attempt count
    lastAttemptCountRef.current = attemptCount

    // Clear any existing detection interval and timeout
    cleanupDetection()

    console.log("Attempt count changed, resetting smile detection state")
    setHappinessScore(0)
    hasCalledCallbackRef.current = false
    smileDetectedRef.current = false

    // If the component is visible, restart detection
    if (isVisible && !isLoading && videoRef.current) {
      startDetection()
    }
  }, [attemptCount, isVisible, isLoading])

  // Clean up detection resources
  const cleanupDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current)
      detectionTimeoutRef.current = null
    }

    // Stop webcam tracks if they exist
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop()
        }
      })
    }
  }

  // Function to load YouTube IFrame API
  const loadYouTubeAPI = () => {
    // Check if script already exists
    if (document.getElementById("youtube-iframe-api")) {
      console.log("YouTube IFrame API script already exists")
      return
    }

    console.log("Adding YouTube IFrame API script to DOM")

    // Create script element
    const tag = document.createElement("script")
    tag.id = "youtube-iframe-api"
    tag.src = "https://www.youtube.com/iframe_api"

    // Insert script before the first script tag
    const firstScriptTag = document.getElementsByTagName("script")[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      console.log("YouTube IFrame API script added to DOM")
    } else {
      document.head.appendChild(tag)
      console.log("YouTube IFrame API script added to head")
    }
  }

  // Load YouTube API as early as possible
  useEffect(() => {
    loadYouTubeAPI()
  }, [])

  // Initialize YouTube API
  useEffect(() => {
    // Store the original callback
    const originalCallback = window.onYouTubeIframeAPIReady

    // Set up our callback
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready")
      setYtApiReady(true)

      // Call the original callback if it exists
      if (typeof originalCallback === "function") {
        originalCallback()
      }
    }

    // Check if the API is already loaded
    if (window.YT && window.YT.Player) {
      console.log("YouTube API already loaded")
      setYtApiReady(true)
    }

    return () => {
      // Restore the original callback when component unmounts
      window.onYouTubeIframeAPIReady = originalCallback
    }
  }, [])

  // Initialize YouTube Player when API is ready
  useEffect(() => {
    if (!ytApiReady) return

    console.log("Initializing YouTube player")
    try {
      const player = new window.YT.Player("rickroll-video", {
        events: {
          onReady: (event) => {
            console.log("YouTube player ready")
            youtubePlayerRef.current = event.target
            setPlayerReady(true)
          },
          onStateChange: (event) => {
            console.log("Player state changed:", event.data)
          },
        },
      })
    } catch (err) {
      console.error("Error initializing YouTube player:", err)
      setError("Failed to initialize video player. Please refresh the page.")
    }
  }, [ytApiReady])

  // Play video when component mounts and shouldPlayOnMount is true
  useEffect(() => {
    if (shouldPlayOnMount && playerReady && youtubePlayerRef.current && !hasPlayedRef.current && isVisible) {
      console.log("Auto-playing video on mount")
      try {
        youtubePlayerRef.current.playVideo()
        hasPlayedRef.current = true
      } catch (err) {
        console.error("Error playing YouTube video:", err)
      }
    }
  }, [shouldPlayOnMount, playerReady, isVisible])

  // Add this function to expose the player to parent components
  const playVideo = () => {
    if (playerReady && youtubePlayerRef.current) {
      try {
        console.log("Playing video directly from user interaction")
        youtubePlayerRef.current.playVideo()
      } catch (err) {
        console.error("Error playing YouTube video:", err)
      }
    } else {
      console.warn("YouTube player not ready yet")
    }
  }

  // Add function to stop and reset the video
  const stopAndResetVideo = () => {
    if (playerReady && youtubePlayerRef.current) {
      try {
        console.log("Stopping video and resetting to beginning")
        youtubePlayerRef.current.pauseVideo() // First pause the video
        youtubePlayerRef.current.seekTo(0, true) // Then reset to beginning
        hasPlayedRef.current = false // Reset the played state
      } catch (err) {
        console.error("Error stopping YouTube video:", err)
      }
    } else {
      console.warn("YouTube player not ready yet")
    }
  }

  // Export the functions via window object
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.playRickroll = playVideo
      window.stopRickroll = stopAndResetVideo
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.playRickroll
        delete window.stopRickroll
      }
    }
  }, [playerReady])

  // Load face-api models
  useEffect(() => {
    // Only load models when the component is visible
    if (!isVisible) return

    const loadModels = async () => {
      try {
        setLoadingStatus("One more thing...")
        console.log("Loading face-api models...")

        // Use the specified CDN URL
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/"

        // Load models one by one to ensure proper loading
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        console.log("✓ Loaded SSD Mobilenet model")

        // Add these lines to restore face landmark and expression detection:
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        console.log("✓ Loaded Face Landmark model")
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        console.log("✓ Loaded Face Expression model")
      } catch (err) {
        console.error("Error loading face-api models:", err)
        setError(`Failed to load facial recognition models: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    loadModels()

    return () => {
      // Clean up
      cleanupDetection()
    }
  }, [isVisible]) // Add isVisible to dependencies

  // Set up webcam after models are loaded
  useEffect(() => {
    // Only set up webcam when component is visible and models are loaded
    if (!isVisible || loadingStatus !== "One more thing..." || !videoRef.current) return

    const setupWebcam = async () => {
      try {
        console.log("Setting up webcam...")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })

        streamRef.current = stream
        videoRef.current.srcObject = stream

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsLoading(false)
                console.log("Webcam setup complete")
                startDetection()
              })
              .catch((err) => {
                console.error("Error playing video:", err)
                setError("Failed to start video stream")
              })
          }
        }
      } catch (err) {
        console.error("Error accessing webcam:", err)
        setError("Failed to access webcam. Please check permissions and try again.")
      }
    }

    setupWebcam()
  }, [loadingStatus, isVisible]) // Add isVisible to dependencies

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupDetection()
    }
  }, [])

  // Start facial expression detection
  const startDetection = () => {
    console.log("Starting facial expression detection...")

    // Reset detection state
    hasCalledCallbackRef.current = false

    // Set timeout to end detection after 5 seconds if no smile detected
    detectionTimeoutRef.current = setTimeout(() => {
      if (!hasCalledCallbackRef.current) {
        console.log("Detection timeout reached without smile")
        cleanupDetection()
        hasCalledCallbackRef.current = true
        onSmileDetected(false)
      }
    }, 5000)

    // Run detection every 500ms
    detectionIntervalRef.current = setInterval(async () => {
      // Skip detection if we've already called the callback
      if (hasCalledCallbackRef.current) return

      if (!videoRef.current || !canvasRef.current) return

      try {
        // Make sure video is playing and ready
        if (videoRef.current.paused || videoRef.current.ended || !videoRef.current.readyState) {
          console.log("Video not ready, skipping detection")
          return
        }

        // Use SSD MobileNet for detection
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceExpressions()

        if (detections) {
          const happyScore = detections.expressions.happy
          console.log("Face detected, happiness score:", happyScore)
          setHappinessScore(happyScore)

          // Draw canvas for debugging (optional)
          const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          }
          faceapi.matchDimensions(canvasRef.current, displaySize)

          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          const ctx = canvasRef.current.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }

          // Check if smile detected (happiness > 0.7)
          if (happyScore > 0.7 && !hasCalledCallbackRef.current) {
            console.log("Smile detected! Happiness score:", happyScore)

            // Mark that we've detected a smile and called the callback
            hasCalledCallbackRef.current = true
            smileDetectedRef.current = true // Set this flag to true when smile is detected

            // Clean up all detection resources
            cleanupDetection()

            // Wait a moment before proceeding to result
            setTimeout(() => {
              onSmileDetected(true)
            }, 1000)
          }
        }
      } catch (err) {
        console.error("Error during face detection:", err)
        // Don't set error state here to avoid disrupting the UI
        // Just log the error and continue trying
      }
    }, 500)
  }

  return (
    <div className={isVisible ? "block" : "hidden"}>
      <div className="flex flex-col items-center space-y-2 sm:space-y-4">
        {/* Always render the iframe but control visibility */}
        <div className="w-full">
          {/* Rickroll video - always in the DOM but only visible at the right step */}
          <div className={`retro-card mb-4 ${isLoading ? "hidden" : ""}`}>
            <div className="relative aspect-video bg-black overflow-hidden">
              <iframe
                id="rickroll-video"
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1&controls=0&playsinline=1&rel=0"
                title="Verification video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Face detection video */}
          <div className={`retro-card hidden`}>
            <div className="relative aspect-video bg-black overflow-hidden">
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror-image"
                />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover mirror-image" />
              </div>

              {/* Happiness score indicator */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded p-2 border border-white">
                <div className="text-xs text-white mb-1">Smile Detection: {Math.round(happinessScore * 100)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 border border-white">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full"
                    style={{ width: `${Math.min(happinessScore * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="animate-spin text-orange-500 text-4xl">⏳</div>
            <p className="text-lg">{loadingStatus}</p>
          </div>
        ) : null}

        {error && (
          <div className="retro-alert bg-red-100 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
