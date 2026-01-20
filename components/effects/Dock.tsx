'use client'

import { useRef, useState, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface DockProps {
  children: ReactNode
  className?: string
}

interface DockItemProps {
  children: ReactNode
  onClick?: () => void
}

export function Dock({ children, className = '' }: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`flex items-end gap-1 px-3 py-2 rounded-2xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <DockIcon key={i} mouseX={mouseX}>
              {child}
            </DockIcon>
          ))
        : children}
    </motion.div>
  )
}

function DockIcon({
  children,
  mouseX,
}: {
  children: ReactNode
  mouseX: ReturnType<typeof useMotionValue<number>>
}) {
  const ref = useRef<HTMLDivElement>(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-120, 0, 120], [44, 60, 44])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.div
      ref={ref}
      style={{ width }}
      className="aspect-square flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

export function DockItem({ children, onClick }: DockItemProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="w-full h-full flex items-center justify-center text-xl md:text-2xl"
    >
      {children}
    </motion.button>
  )
}
