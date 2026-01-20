'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { RotateCcw } from 'lucide-react'
import { FloatingReactions } from './FloatingReactions'
import { SurealLogo } from '@/components/SurealLogo'
import { Button } from '@/components/ui/Button'
import type { Premiere } from '@/lib/types'

interface CinemaTheaterProps {
  premiere: Premiere
  playbackToken?: string
}

type VideoState = 'idle' | 'playing' | 'paused' | 'ended'

export function CinemaTheater({ premiere, playbackToken }: CinemaTheaterProps) {
  const mainPlayerRef = useRef<MuxPlayerElement>(null)
  const ambientVideoRef = useRef<HTMLVideoElement>(null)
  
  const [videoState, setVideoState] = useState<VideoState>('idle')
  const [showIntro, setShowIntro] = useState(true)
  const [showControls, setShowControls] = useState(true)

  // Get the video stream URL for ambient
  const streamUrl = `https://stream.mux.com/${premiere.mux_playback_id}.m3u8`
  const thumbnailUrl = `https://image.mux.com/${premiere.mux_playback_id}/thumbnail.jpg`

  // Sync ambient video with main player
  const syncAmbient = useCallback((action: 'play' | 'pause', time?: number) => {
    const ambient = ambientVideoRef.current
    if (!ambient) return
    
    try {
      if (typeof time === 'number') {
        ambient.currentTime = time
      }
      if (action === 'play') {
        ambient.play().catch(() => {})
      } else {
        ambient.pause()
      }
    } catch {}
  }, [])

  const handlePlay = useCallback(() => {
    setVideoState('playing')
    setShowIntro(false)
    const main = mainPlayerRef.current
    if (main) {
      syncAmbient('play', main.currentTime)
    }
  }, [syncAmbient])

  const handlePause = useCallback(() => {
    setVideoState('paused')
    syncAmbient('pause')
  }, [syncAmbient])

  const handleEnded = useCallback(() => {
    setVideoState('ended')
    syncAmbient('pause')
  }, [syncAmbient])

  // Time sync
  useEffect(() => {
    if (videoState !== 'playing') return
    const interval = setInterval(() => {
      const main = mainPlayerRef.current
      const ambient = ambientVideoRef.current
      if (main && ambient && Math.abs(main.currentTime - ambient.currentTime) > 1) {
        ambient.currentTime = main.currentTime
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [videoState])

  // Auto-hide UI
  useEffect(() => {
    if (videoState !== 'playing') {
      setShowControls(true)
      return
    }
    let timeout: NodeJS.Timeout
    const onMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchstart', onMove)
    timeout = setTimeout(() => setShowControls(false), 3000)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchstart', onMove)
      clearTimeout(timeout)
    }
  }, [videoState])

  const handleReplay = useCallback(() => {
    const main = mainPlayerRef.current
    if (main) {
      main.currentTime = 0
      main.play()
      setVideoState('playing')
    }
  }, [])

  const handleStart = useCallback(() => {
    const main = mainPlayerRef.current
    if (main) {
      main.play()
    }
    setShowIntro(false)
  }, [])

  const tokens = playbackToken ? { playback: playbackToken } : undefined
  const isActive = videoState === 'playing' || videoState === 'paused'
  const hasEnded = videoState === 'ended'

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Ambient Glow - using native video for full control */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hasEnded ? 0 : isActive ? 0.7 : 0.4 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          filter: 'blur(100px) saturate(1.3)',
          transform: 'scale(1.5)',
        }}
      >
        <video
          ref={ambientVideoRef}
          src={streamUrl}
          poster={thumbnailUrl}
          muted
          playsInline
          loop
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            position: 'absolute',
            top: '-25%',
            left: '-25%',
            width: '150%',
            height: '150%',
          }}
        />
      </motion.div>

      {/* Vignette */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-10"
        animate={{
          background: hasEnded 
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.95) 100%)'
            : showIntro
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.9) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)'
        }}
        transition={{ duration: 2 }}
      />

      {/* Main Video */}
      <div className="relative z-20 flex items-center justify-center min-h-[100dvh] p-4 md:p-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: hasEnded ? 0.92 : 1, 
            opacity: hasEnded ? 0.7 : 1 
          }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl"
        >
          <MuxPlayer
            ref={mainPlayerRef}
            playbackId={premiere.mux_playback_id}
            tokens={tokens}
            streamType="on-demand"
            accentColor="#ffffff"
            primaryColor="#ffffff"
            autoPlay
            metadata={{ video_title: premiere.title }}
            className="w-full"
            style={{ 
              aspectRatio: 'auto',
              maxHeight: '75dvh',
            }}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
          />

          {/* Title */}
          <motion.div
            animate={{ 
              opacity: showControls && !showIntro && !hasEnded ? 1 : 0,
            }}
            transition={{ duration: 0.4 }}
            className="mt-4 flex items-center justify-between"
          >
            <div>
              <h1 className="text-lg font-normal text-white/90">{premiere.title}</h1>
              {premiere.description && (
                <p className="text-sm text-white/40 mt-1">{premiere.description}</p>
              )}
            </div>
            <SurealLogo size="sm" animate={false} className="opacity-40" />
          </motion.div>
        </motion.div>
      </div>

      {/* Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black cursor-pointer"
            onClick={handleStart}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <SurealLogo size="lg" animate={false} />
              <span className="label">Presents</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-white/30 text-xs mt-8"
              >
                Tap to begin
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outro */}
      <AnimatePresence>
        {hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <SurealLogo size="md" animate={false} className="opacity-60" />
              <span className="text-white/50 text-sm">{premiere.title}</span>
              <span className="text-white/20 text-xs">A Sureal Studio Production</span>
              
              <Button 
                variant="underline" 
                onClick={handleReplay}
                className="mt-6 flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Watch again</span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactions */}
      <FloatingReactions premiereId={premiere.id} enabled={videoState === 'playing'} />
    </div>
  )
}
