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

const EMOJIS = ['🔥', '❤️', '✨', '👀', '💯']

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
      setReactions((prev) => prev.filter((r) => Date.now() - r.createdAt < 4000))
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
          x: payload.x || Math.random() * 70 + 15,
          createdAt: Date.now(),
        }
        setReactions((prev) => [...prev, newReaction])
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
        x: Math.random() * 70 + 15,
      },
    })
  }, [])

  if (!enabled) return null

  return (
    <>
      {/* Floating reactions */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        <AnimatePresence>
          {reactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 1, y: '100vh', scale: 1 }}
              animate={{ opacity: 0, y: '-10vh', scale: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute text-3xl"
              style={{ left: `${reaction.x}%` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass px-3 py-2 flex items-center gap-1"
        >
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileTap={{ scale: 0.85 }}
              onClick={() => sendReaction(emoji)}
              className="text-xl p-2 hover:bg-white/5 rounded transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </>
  )
}
