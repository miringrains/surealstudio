'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CountdownTimerProps {
  targetDate: Date
  onComplete: () => void
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date()
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      completed: false,
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft()
      setTimeLeft(newTime)
      if (newTime.completed) {
        onComplete()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (timeLeft.completed) {
    return (
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="label"
      >
        Live now
      </motion.span>
    )
  }

  const units = [
    { value: timeLeft.days, label: 'd' },
    { value: timeLeft.hours, label: 'h' },
    { value: timeLeft.minutes, label: 'm' },
    { value: timeLeft.seconds, label: 's' },
  ].filter((unit, i) => unit.value > 0 || i >= 2) // Always show at least minutes and seconds

  return (
    <div className="flex items-baseline gap-1">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-baseline">
          <motion.span
            key={`${unit.label}-${unit.value}`}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-light tabular-nums text-white/90"
          >
            {String(unit.value).padStart(2, '0')}
          </motion.span>
          <span className="text-white/30 text-sm ml-0.5 mr-3">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
