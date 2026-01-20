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
        "font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      style={{
        padding: '14px 28px',
        fontSize: '15px',
        borderRadius: '14px',
      }}
    >
      {children}
    </motion.button>
  )
}
