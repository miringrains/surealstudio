'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Dock, DockItem } from '@/components/effects/Dock'
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
      {/* Floating emojis - behind video (z-[1]) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ 
                opacity: 1, 
                y: '100vh', 
                scale: 1,
                x: `${reaction.x}vw`,
              }}
              animate={{ 
                opacity: [1, 1, 1, 0],
                y: '-50vh',
                scale: [1, 1.5, 2, 2.5],
              }}
              transition={{ 
                duration: 4,
                ease: 'easeOut',
                opacity: { times: [0, 0.6, 0.9, 1] },
                scale: { times: [0, 0.3, 0.7, 1] },
              }}
              className="absolute text-4xl md:text-5xl"
              style={{ 
                left: 0,
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dock-style reaction bar */}
      <motion.div 
        className="fixed bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-[6]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Dock>
          {EMOJIS.map((emoji) => (
            <DockItem key={emoji} onClick={() => sendReaction(emoji)}>
              {emoji}
            </DockItem>
          ))}
        </Dock>
      </motion.div>
    </>
  )
}
