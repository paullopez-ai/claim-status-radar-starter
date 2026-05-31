"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingOverlayProps {
  isVisible: boolean
  phaseMessages?: [string, string]
}

export function LoadingOverlay({ isVisible, phaseMessages }: LoadingOverlayProps) {
  const phase1 = phaseMessages?.[0] ?? "Checking 8 claims in parallel..."
  const phase2 = phaseMessages?.[1] ?? "Analyzing AR pipeline..."
  const [phase, setPhase] = useState<1 | 2>(1)

  useEffect(() => {
    if (isVisible) {
      setPhase(1)
      const timer = setTimeout(() => setPhase(2), 400)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm font-sans text-muted-foreground">
              {phase === 1 ? phase1 : phase2}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
