'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CinemaTheater } from '@/components/theater/CinemaTheater'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { SurealLogo } from '@/components/SurealLogo'
import { createClient } from '@/lib/supabase/client'
import type { Premiere } from '@/lib/types'

export default function TheaterPage() {
  const params = useParams()
  const router = useRouter()
  const premiereId = params.id as string

  const [premiere, setPremiere] = useState<Premiere | null>(null)
  const [playbackToken, setPlaybackToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        // Check if user has access
        const storedEmail = localStorage.getItem(`premiere_${premiereId}_email`)
        if (!storedEmail) {
          router.push('/')
          return
        }

        const supabase = createClient()

        // Fetch premiere
        const { data: premiereData, error: premiereError } = await supabase
          .from('premieres')
          .select('*')
          .eq('id', premiereId)
          .single()

        if (premiereError || !premiereData) {
          setError('Premiere not found')
          setIsLoading(false)
          return
        }

        setPremiere(premiereData)

        // For demo: always treat as live (bypass countdown)
        setIsLive(true)

        // Fetch playback token
        if (true) {
          try {
            const tokenResponse = await fetch('/api/mux-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ playbackId: premiereData.mux_playback_id }),
            })

            const tokenData = await tokenResponse.json()
            if (tokenData.token) {
              setPlaybackToken(tokenData.token)
            }
          } catch (tokenError) {
            console.error('Failed to fetch playback token:', tokenError)
            // Continue without token (will use public playback)
          }
        }

        setIsLoading(false)
      } catch (err) {
        setError('Failed to load premiere')
        setIsLoading(false)
      }
    }

    initialize()
  }, [premiereId, router])

  const handleCountdownComplete = () => {
    setIsLive(true)
    
    // Fetch playback token
    if (premiere) {
      fetch('/api/mux-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbackId: premiere.mux_playback_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            setPlaybackToken(data.token)
          }
        })
        .catch(console.error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <SurealLogo size="md" />
          <div className="w-8 h-8 border border-white/20 border-t-white/80 rounded-full animate-spin" />
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !premiere) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <SurealLogo size="md" />
          <h1 className="text-2xl font-light">{error || 'Premiere not found'}</h1>
          <button onClick={() => router.push('/')} className="btn">
            Return Home
          </button>
        </motion.div>
      </div>
    )
  }

  // Waiting room (premiere not yet live)
  if (!isLive) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Background ambient effect */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center gap-12 px-8"
        >
          <SurealLogo size="lg" />

          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-label">Premiere Starting In</span>
            <h1 className="text-2xl md:text-4xl font-light tracking-tight">
              {premiere.title}
            </h1>
          </div>

          <CountdownTimer
            targetDate={new Date(premiere.scheduled_at)}
            onComplete={handleCountdownComplete}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white-muted text-sm text-center max-w-md"
          >
            Stay on this page. The theater will open automatically when the premiere begins.
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Cinema theater (premiere is live)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="theater"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <CinemaTheater
          premiere={premiere}
          playbackToken={playbackToken || undefined}
        />
      </motion.div>
    </AnimatePresence>
  )
}
