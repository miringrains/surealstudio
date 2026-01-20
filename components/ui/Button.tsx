'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MetallicButton } from '@/components/effects/MetallicPaint'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'metallic' | 'outline'
  className?: string
  type?: 'button' | 'submit'
}

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'metallic',
  className,
  type = 'button'
}: ButtonProps) {
  
  if (variant === 'metallic') {
    return (
      <MetallicButton
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {children}
      </MetallicButton>
    )
  }

  // Outline variant
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/15 hover:border-white/25 transition-all duration-300",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
