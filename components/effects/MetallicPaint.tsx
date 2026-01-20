'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
  className
}: MetallicButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative overflow-hidden cursor-pointer',
        'font-semibold text-white',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      style={{
        // Explicit sizing - no Tailwind dependency
        padding: '20px 48px',
        fontSize: '18px',
        borderRadius: '20px',
        minWidth: '240px',
        // Visual
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #1a1a2e 50%, #0f0f1a 100%)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.2), 0 8px 32px -8px rgba(0,0,0,0.6), 0 0 60px -15px rgba(99, 102, 241, 0.4)',
      }}
    >
      {/* Liquid metal blobs */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ borderRadius: '20px' }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(139,92,246,0) 70%)',
            filter: 'blur(25px)',
          }}
          animate={{
            x: ['-30%', '130%', '-30%'],
            y: ['-20%', '60%', '-20%'],
          }}
          transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
        />
        
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.8) 0%, rgba(34,211,238,0) 70%)',
            filter: 'blur(22px)',
          }}
          animate={{
            x: ['130%', '-30%', '130%'],
            y: ['60%', '-20%', '60%'],
          }}
          transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
        />
        
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '90px',
            height: '90px',
            background: 'radial-gradient(circle, rgba(244,114,182,0.7) 0%, rgba(244,114,182,0) 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            x: ['50%', '-10%', '110%', '50%'],
            y: ['110%', '0%', '40%', '110%'],
          }}
          transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
        />

        <motion.div
          className="absolute rounded-full"
          style={{
            width: '150px',
            height: '60px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(12px)',
          }}
          animate={{
            x: ['-40%', '110%'],
            y: ['10%', '40%'],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>

      {/* Glass overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Top edge highlight */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '1px',
          borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.4) 50%, transparent 90%)',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  )
}
