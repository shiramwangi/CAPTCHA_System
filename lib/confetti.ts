// This is a simple wrapper for canvas-confetti
// We're using a module declaration to avoid TypeScript errors

declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number
    angle?: number
    spread?: number
    startVelocity?: number
    decay?: number
    gravity?: number
    drift?: number
    ticks?: number
    origin?: {
      x?: number
      y?: number
    }
    colors?: string[]
    shapes?: string[]
    scalar?: number
    zIndex?: number
    disableForReducedMotion?: boolean
  }

  function confetti(options?: ConfettiOptions): Promise<null>

  export = confetti
}
