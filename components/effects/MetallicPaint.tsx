'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MetallicPaintProps {
  children: ReactNode
  className?: string
}

export function MetallicPaint({ children, className = '' }: MetallicPaintProps) {
  return (
    <motion.div 
      className={`relative overflow-hidden ${className}`}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      {/* Metallic animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(255, 119, 115, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(74, 144, 226, 0.2) 0%, transparent 40%),
            radial-gradient(circle at 60% 20%, rgba(255, 190, 118, 0.2) 0%, transparent 40%),
            linear-gradient(135deg, rgba(30, 30, 40, 1) 0%, rgba(20, 20, 30, 1) 100%)
          `,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 8,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
      
      {/* Metallic shimmer overlay */}
      <motion.div
        className="absolute inset-0 z-[1] opacity-40"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
        variants={{
          hover: {
            backgroundPosition: ['200% 200%', '-100% -100%'],
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }
        }}
      />

      {/* Noise texture */}
      <div 
        className="absolute inset-0 z-[2] opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-[3]">
        {children}
      </div>
    </motion.div>
  )
}
