'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Reaction {
  id: string
  emoji: string
  x: number
  createdAt: number
}

const EMOJIS = ['🔥', '❤️', '🙌', '👀', '💯', '✨', '🎬', '🖤']

interface FloatingReactionsProps {
  premiereId: string
  enabled?: boolean
}

export function FloatingReactions({ premiereId, enabled = true }: FloatingReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [isHovering, setIsHovering] = useState(false)

  // Remove expired reactions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setReactions((prev) => prev.filter((r) => now - r.createdAt < 4000))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Subscribe to realtime reactions
  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    
    const channel = supabase
      .channel(`reactions:${premiereId}`)
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const newReaction: Reaction = {
          id: `${Date.now()}-${Math.random()}`,
          emoji: payload.emoji,
          x: payload.x || Math.random() * 80 + 10,
          createdAt: Date.now(),
        }
        setReactions((prev) => [...prev, newReaction])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [premiereId, enabled])

  const sendReaction = useCallback(async (emoji: string) => {
    const supabase = createClient()
    
    // Broadcast to all viewers
    await supabase.channel(`reactions:${premiereId}`).send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        emoji,
        x: Math.random() * 80 + 10,
      },
    })

    // Also add locally for immediate feedback
    const newReaction: Reaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.random() * 80 + 10,
      createdAt: Date.now(),
    }
    setReactions((prev) => [...prev, newReaction])
  }, [premiereId])

  if (!enabled) return null

  return (
    <>
      {/* Floating reactions */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 1, 
                y: '100vh',
                x: `${reaction.x}vw`,
                scale: 1,
              }}
              animate={{ 
                opacity: 0, 
                y: '-10vh',
                scale: 0.5,
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute text-4xl"
              style={{
                left: `${reaction.x}%`,
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction picker */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovering ? 1 : 0.4,
            y: 0,
          }}
          transition={{ duration: 0.3 }}
          className="glass px-4 py-3 flex items-center gap-2"
        >
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => sendReaction(emoji)}
              className="text-2xl p-2 hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </>
  )
}
