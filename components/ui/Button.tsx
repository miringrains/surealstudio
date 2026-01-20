'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'underline'
  className?: string
  type?: 'button' | 'submit'
}

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  className,
  type = 'button'
}: ButtonProps) {
  const baseStyles = "relative font-normal text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "px-6 py-3 text-white/90 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5",
    ghost: "px-4 py-2 text-white/60 hover:text-white",
    underline: "pb-1 text-white/60 hover:text-white border-b border-white/20 hover:border-white/60"
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
    >
      {children}
    </motion.button>
  )
}
