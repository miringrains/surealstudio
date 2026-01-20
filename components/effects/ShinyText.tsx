'use client'

import { motion } from 'framer-motion'

interface ShinyTextProps {
  children: string
  className?: string
  delay?: number
}

export function ShinyText({ children, className = '', delay = 0 }: ShinyTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={`relative inline-block ${className}`}
    >
      <span className="relative">
        {children}
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 3,
            ease: 'linear',
            repeat: Infinity,
            repeatDelay: 4,
            delay: delay + 1,
          }}
        >
          {children}
        </motion.span>
      </span>
    </motion.span>
  )
}
