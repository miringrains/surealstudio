'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MetallicButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export function MetallicButton({ 
  children, 
  onClick, 
  disabled = false,
  type = 'button',
  className = ''
}: MetallicButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative overflow-hidden rounded-2xl
        px-10 py-4
        text-base font-semibold tracking-tight text-white
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer
        ${className}
      `}
      style={{
        background: `
          linear-gradient(
            135deg,
            #1a1a2e 0%,
            #16213e 25%,
            #1a1a2e 50%,
            #0f0f1a 100%
          )
        `,
        boxShadow: `
          inset 0 1px 0 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 0 rgba(0,0,0,0.3),
          0 4px 20px -5px rgba(0,0,0,0.5),
          0 0 40px -10px rgba(99, 102, 241, 0.3)
        `,
      }}
    >
      {/* Liquid metal blobs */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {/* Blob 1 - Purple */}
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            x: ['-20%', '120%', '-20%'],
            y: ['0%', '50%', '0%'],
          }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        
        {/* Blob 2 - Cyan */}
        <motion.div
          className="absolute w-28 h-28 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.7) 0%, rgba(34,211,238,0) 70%)',
            filter: 'blur(18px)',
          }}
          animate={{
            x: ['120%', '-20%', '120%'],
            y: ['60%', '-10%', '60%'],
          }}
          transition={{
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        
        {/* Blob 3 - Pink */}
        <motion.div
          className="absolute w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.6) 0%, rgba(244,114,182,0) 70%)',
            filter: 'blur(16px)',
          }}
          animate={{
            x: ['50%', '0%', '100%', '50%'],
            y: ['100%', '0%', '50%', '100%'],
          }}
          transition={{
            duration: 12,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />

        {/* Blob 4 - White/Silver highlight */}
        <motion.div
          className="absolute w-40 h-20 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(10px)',
          }}
          animate={{
            x: ['-30%', '100%'],
            y: ['20%', '30%'],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </div>

      {/* Glass overlay for depth */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Top edge highlight */}
      <div 
        className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  )
}
