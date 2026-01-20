'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FlipCounter } from '@/components/effects/FlipCounter'

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
        className="text-sm uppercase tracking-[0.2em] text-white/70"
      >
        Live now
      </motion.span>
    )
  }

  const units = [
    { value: timeLeft.days, label: 'Days', show: timeLeft.days > 0 },
    { value: timeLeft.hours, label: 'Hours', show: timeLeft.days > 0 || timeLeft.hours > 0 },
    { value: timeLeft.minutes, label: 'Min', show: true },
    { value: timeLeft.seconds, label: 'Sec', show: true },
  ].filter(u => u.show)

  return (
    <div className="flex items-center gap-8 md:gap-12">
      {units.map((unit, i) => (
        <motion.div 
          key={unit.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="text-4xl md:text-6xl font-light text-white tracking-tight">
            <FlipCounter value={unit.value} />
          </div>
          <span className="mt-3 text-xs uppercase tracking-[0.15em] text-white/70">
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
