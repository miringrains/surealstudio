'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

interface LobbyCountProps {
  premiereId: string
}

export function LobbyCount({ premiereId }: LobbyCountProps) {
  const [count, setCount] = useState(1) // Start with 1 (self)

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase.channel(`lobby:${premiereId}`, {
      config: {
        presence: {
          key: Math.random().toString(36).substring(7),
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const userCount = Object.keys(state).length
        setCount(Math.max(1, userCount))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [premiereId])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="flex items-center gap-2 text-white/50"
    >
      <Users size={14} strokeWidth={1.5} />
      <span className="text-sm tabular-nums">
        {count} {count === 1 ? 'viewer' : 'viewers'} waiting
      </span>
    </motion.div>
  )
}
