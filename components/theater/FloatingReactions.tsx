'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Reaction {
  id: string
  emoji: string
  x: number
  createdAt: number
}

const EMOJIS = ['🔥', '❤️', '✨', '👏', '🎬']

interface FloatingReactionsProps {
  premiereId: string
  enabled?: boolean
}

export function FloatingReactions({ premiereId, enabled = true }: FloatingReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Cleanup old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((prev) => prev.filter((r) => Date.now() - r.createdAt < 4500))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Realtime subscription
  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    
    const channel = supabase
      .channel(`reactions:${premiereId}`, {
        config: { broadcast: { self: true } }
      })
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const newReaction: Reaction = {
          id: `${Date.now()}-${Math.random()}`,
          emoji: payload.emoji,
          x: payload.x || Math.random() * 60 + 20,
          createdAt: Date.now(),
        }
        setReactions((prev) => [...prev.slice(-30), newReaction])
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [premiereId, enabled])

  const sendReaction = useCallback((emoji: string) => {
    if (!channelRef.current) return
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        emoji,
        x: Math.random() * 60 + 20,
      },
    })
  }, [])

  if (!enabled) return null

  return (
    <>
      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 1, 
                y: '100vh', 
                scale: 0.8,
                x: `${reaction.x}vw`,
              }}
              animate={{ 
                opacity: [1, 1, 0],
                y: '-5vh',
                scale: [0.8, 1.1, 0.9],
              }}
              transition={{ 
                duration: 4.5,
                ease: [0.16, 1, 0.3, 1],
                opacity: { times: [0, 0.7, 1] },
                scale: { times: [0, 0.3, 1] },
              }}
              className="absolute text-2xl md:text-3xl"
              style={{ 
                left: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction picker bar */}
      <div 
        className="fixed bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-[6]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0.6,
            y: 0,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {EMOJIS.map((emoji, i) => (
            <motion.button
              key={emoji}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.05 }}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => sendReaction(emoji)}
              className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-lg md:text-xl rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </>
  )
}
