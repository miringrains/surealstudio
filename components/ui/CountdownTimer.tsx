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
        className="text-lg uppercase tracking-[0.3em] text-white"
      >
        Live Now
      </motion.span>
    )
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <div className="flex items-center justify-center gap-6 md:gap-10">
      {units.map((unit, i) => (
        <motion.div 
          key={unit.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          className="flex flex-col items-center min-w-[60px] md:min-w-[80px]"
        >
          <div className="text-3xl md:text-4xl font-semibold text-white tabular-nums">
            {String(unit.value).padStart(2, '0')}
          </div>
          <span className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/60">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
