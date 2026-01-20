'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MetallicPaint } from '@/components/effects/MetallicPaint'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'metallic' | 'ghost' | 'outline'
  size?: 'default' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'metallic',
  size = 'default',
  className,
  type = 'button'
}: ButtonProps) {
  
  if (variant === 'metallic') {
    return (
      <MetallicPaint
        className={cn(
          "rounded-full cursor-pointer",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "w-full font-medium tracking-wide text-white",
            size === 'default' && "px-7 py-3.5 text-sm",
            size === 'lg' && "px-9 py-4 text-base"
          )}
        >
          {children}
        </button>
      </MetallicPaint>
    )
  }

  if (variant === 'outline') {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "rounded-full font-medium tracking-wide text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-300",
          size === 'default' && "px-6 py-3 text-sm",
          size === 'lg' && "px-8 py-3.5 text-base",
          disabled && "opacity-40 cursor-not-allowed",
          className
        )}
      >
        {children}
      </motion.button>
    )
  }

  // Ghost variant
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "font-medium tracking-wide text-white/50 hover:text-white transition-colors duration-300",
        size === 'default' && "px-4 py-2 text-sm",
        size === 'lg' && "px-6 py-3 text-base",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
