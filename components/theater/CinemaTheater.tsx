'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { FloatingReactions } from './FloatingReactions'
import { SurealLogo } from '@/components/SurealLogo'
import type { Premiere } from '@/lib/types'

interface CinemaTheaterProps {
  premiere: Premiere
  playbackToken?: string
}

type VideoState = 'idle' | 'playing' | 'paused' | 'ended'

export function CinemaTheater({ premiere, playbackToken }: CinemaTheaterProps) {
  const mainPlayerRef = useRef<MuxPlayerElement>(null)
  const ambientPlayerRef = useRef<MuxPlayerElement>(null)
  
  const [videoState, setVideoState] = useState<VideoState>('idle')
  const [showIntro, setShowIntro] = useState(true)
  const [showControls, setShowControls] = useState(true)

  // Sync ambient player with main player
  const syncAmbientPlayer = useCallback((action: 'play' | 'pause') => {
    const ambientPlayer = ambientPlayerRef.current
    if (!ambientPlayer) return
    
    try {
      if (action === 'play') {
        ambientPlayer.play()
      } else {
        ambientPlayer.pause()
      }
    } catch (e) {
      // Ignore autoplay errors
    }
  }, [])

  // Handle video events
  const handlePlay = useCallback(() => {
    setVideoState('playing')
    setShowIntro(false)
    syncAmbientPlayer('play')
  }, [syncAmbientPlayer])

  const handlePause = useCallback(() => {
    setVideoState('paused')
    syncAmbientPlayer('pause')
  }, [syncAmbientPlayer])

  const handleEnded = useCallback(() => {
    setVideoState('ended')
    syncAmbientPlayer('pause')
  }, [syncAmbientPlayer])

  // Auto-hide controls when playing
  useEffect(() => {
    if (videoState !== 'playing') {
      setShowControls(true)
      return
    }

    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    timeout = setTimeout(() => setShowControls(false), 3000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [videoState])

  const tokens = playbackToken ? { playback: playbackToken } : undefined
  
  // Derived states for visual effects
  const isActive = videoState === 'playing' || videoState === 'paused'
  const hasEnded = videoState === 'ended'

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Ambient Glow Layer - fades out when video ends */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          opacity: hasEnded ? 0 : isActive ? 0.45 : 0.2,
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <MuxPlayer
          ref={ambientPlayerRef}
          playbackId={premiere.mux_playback_id}
          tokens={tokens}
          muted
          loop
          className="w-full h-full object-cover ambient-glow"
          style={{ position: 'absolute', inset: 0 }}
        />
      </motion.div>

      {/* Vignette Overlay - intensifies on intro/outro */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        animate={{
          background: hasEnded 
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)'
            : showIntro
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.8) 100%)'
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Main Player Container */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-4 md:p-8 lg:p-16">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ 
            scale: hasEnded ? 0.95 : 1, 
            opacity: hasEnded ? 0.8 : 1 
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-7xl"
        >
          {/* Main Player */}
          <motion.div 
            className="relative shadow-2xl shadow-black/50"
            animate={{
              boxShadow: isActive 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(255,255,255,0.03)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            transition={{ duration: 1.5 }}
          >
            <MuxPlayer
              ref={mainPlayerRef}
              playbackId={premiere.mux_playback_id}
              tokens={tokens}
              streamType="on-demand"
              accentColor="#ffffff"
              primaryColor="#ffffff"
              autoPlay
              metadata={{
                video_title: premiere.title,
              }}
              className="w-full"
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            />
          </motion.div>

          {/* Title & Info - fades based on state */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showControls && !showIntro ? 1 : 0, 
              y: showControls && !showIntro ? 0 : 10 
            }}
            transition={{ duration: 0.5 }}
            className="mt-6 flex items-center justify-between"
          >
            <div>
              <h1 className="text-xl md:text-2xl font-light tracking-tight">
                {premiere.title}
              </h1>
              {premiere.description && (
                <p className="text-white-muted text-sm mt-1">
                  {premiere.description}
                </p>
              )}
            </div>
            <SurealLogo size="sm" animate={false} className="opacity-50" />
          </motion.div>
        </motion.div>
      </div>

      {/* Cinematic Intro Overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, y: -20 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <SurealLogo size="lg" animate={false} />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-label tracking-[0.3em]"
              >
                PRESENTS
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Outro Overlay */}
      <AnimatePresence>
        {hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-8"
            >
              <SurealLogo size="md" animate={false} className="opacity-70" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/60 text-sm tracking-widest uppercase">
                  {premiere.title}
                </span>
                <span className="text-white/30 text-xs tracking-[0.2em] uppercase">
                  A Sureal Studio Production
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Reactions - only when playing */}
      <FloatingReactions premiereId={premiere.id} enabled={videoState === 'playing'} />
    </div>
  )
}
