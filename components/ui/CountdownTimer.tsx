'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTimeRemaining, formatTimeUnit } from '@/lib/utils'
import type { TimeRemaining } from '@/lib/types'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

function CountdownDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="countdown-digit block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-label">{label}</span>
    </div>
  )
}

function Separator() {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="countdown-separator self-start mt-2"
    >
      :
    </motion.span>
  )
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateCountdown = () => {
      const remaining = getTimeRemaining(targetDate)
      setTimeRemaining(remaining)
      
      if (remaining.isLive && onComplete) {
        onComplete()
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <CountdownDigit value="00" label="Days" />
        <Separator />
        <CountdownDigit value="00" label="Hours" />
        <Separator />
        <CountdownDigit value="00" label="Mins" />
        <Separator />
        <CountdownDigit value="00" label="Secs" />
      </div>
    )
  }

  if (timeRemaining.isLive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-red-500"
          />
          <span className="text-mono text-xl tracking-widest">LIVE NOW</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="flex items-center justify-center gap-4 md:gap-8"
    >
      {timeRemaining.days > 0 && (
        <>
          <CountdownDigit 
            value={formatTimeUnit(timeRemaining.days)} 
            label="Days" 
          />
          <Separator />
        </>
      )}
      <CountdownDigit 
        value={formatTimeUnit(timeRemaining.hours)} 
        label="Hours" 
      />
      <Separator />
      <CountdownDigit 
        value={formatTimeUnit(timeRemaining.minutes)} 
        label="Mins" 
      />
      <Separator />
      <CountdownDigit 
        value={formatTimeUnit(timeRemaining.seconds)} 
        label="Secs" 
      />
    </motion.div>
  )
}
