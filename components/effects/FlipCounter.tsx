'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FlipDigitProps {
  value: number
}

function FlipDigit({ value }: FlipDigitProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value
      setDisplayValue(value)
    }
  }, [value])

  return (
    <div className="relative w-[1.1em] h-[1.4em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
          transition={{ 
            duration: 0.4, 
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0 flex items-center justify-center tabular-nums"
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

interface FlipCounterProps {
  value: number
  padLength?: number
}

export function FlipCounter({ value, padLength = 2 }: FlipCounterProps) {
  const digits = String(value).padStart(padLength, '0').split('')
  
  return (
    <div className="flex">
      {digits.map((digit, i) => (
        <FlipDigit key={i} value={parseInt(digit)} />
      ))}
    </div>
  )
}
