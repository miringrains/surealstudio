'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { RotateCcw } from 'lucide-react'
import { FloatingReactions } from './FloatingReactions'
import { SurealLogo } from '@/components/SurealLogo'
import { ShinyText } from '@/components/effects/ShinyText'
import { Button } from '@/components/ui/Button'
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
  const [showUI, setShowUI] = useState(true)

  // Thumbnail for ambient
  const thumbnailUrl = `https://image.mux.com/${premiere.mux_playback_id}/thumbnail.jpg?time=10&width=1920`

  // Sync ambient with main
  const syncAmbient = useCallback((action: 'play' | 'pause', time?: number) => {
    const ambient = ambientPlayerRef.current
    if (!ambient) return
    try {
      if (typeof time === 'number' && Math.abs(ambient.currentTime - time) > 1) {
        ambient.currentTime = time
      }
      action === 'play' ? ambient.play() : ambient.pause()
    } catch {}
  }, [])

  const handlePlay = useCallback(() => {
    setVideoState('playing')
    setShowIntro(false)
    const main = mainPlayerRef.current
    if (main) syncAmbient('play', main.currentTime)
  }, [syncAmbient])

  const handlePause = useCallback(() => {
    setVideoState('paused')
    syncAmbient('pause')
  }, [syncAmbient])

  const handleEnded = useCallback(() => {
    setVideoState('ended')
    syncAmbient('pause')
  }, [syncAmbient])

  // Periodic time sync
  useEffect(() => {
    if (videoState !== 'playing') return
    const interval = setInterval(() => {
      const main = mainPlayerRef.current
      const ambient = ambientPlayerRef.current
      if (main && ambient && Math.abs(main.currentTime - ambient.currentTime) > 0.5) {
        ambient.currentTime = main.currentTime
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [videoState])

  // Auto-hide UI
  useEffect(() => {
    if (videoState !== 'playing') {
      setShowUI(true)
      return
    }
    let timeout: NodeJS.Timeout
    const show = () => {
      setShowUI(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowUI(false), 3000)
    }
    window.addEventListener('mousemove', show)
    window.addEventListener('touchstart', show)
    timeout = setTimeout(() => setShowUI(false), 3000)
    return () => {
      window.removeEventListener('mousemove', show)
      window.removeEventListener('touchstart', show)
      clearTimeout(timeout)
    }
  }, [videoState])

  const handleReplay = useCallback(() => {
    const main = mainPlayerRef.current
    if (main) {
      main.currentTime = 0
      main.play()
    }
  }, [])

  const handleStart = useCallback(() => {
    mainPlayerRef.current?.play()
    setShowIntro(false)
  }, [])

  const tokens = playbackToken ? { playback: playbackToken } : undefined
  const isActive = videoState === 'playing' || videoState === 'paused'
  const hasEnded = videoState === 'ended'

  return (
    <div className="fixed inset-0 bg-[#030303] overflow-hidden">
      
      {/* ============ AMBIENT GLOW ============ */}
      {/* Thumbnail base */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ opacity: hasEnded ? 0 : 0.5 }}
        transition={{ duration: 2 }}
      >
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute w-full h-full object-cover"
          style={{
            filter: 'blur(80px) saturate(1.4) brightness(0.8)',
            transform: 'scale(1.3)',
          }}
        />
      </motion.div>

      {/* Dynamic video glow */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none overflow-hidden"
        animate={{ opacity: hasEnded ? 0 : isActive ? 0.6 : 0.3 }}
        transition={{ duration: 1.5 }}
      >
        <div 
          className="absolute inset-[-30%] w-[160%] h-[160%]"
          style={{
            filter: 'blur(100px) saturate(1.5)',
            transform: 'scale(1.2)',
          }}
        >
          <MuxPlayer
            ref={ambientPlayerRef}
            playbackId={premiere.mux_playback_id} 
            tokens={tokens}
            muted
            autoPlay
            loop
            preload="auto"
            className="ambient-mux-player w-full h-full"
          />
        </div>
      </motion.div>

      {/* Vignette */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-1000"
        style={{
          background: hasEnded
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 100%)'
            : 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* ============ MAIN VIDEO ============ */}
      <div className="relative z-[3] flex items-center justify-center min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ 
            opacity: hasEnded ? 0.6 : 1,
            scale: hasEnded ? 0.94 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
          style={{ maxWidth: '90vh' }} // Constrain width for vertical videos
        >
          {/* Video container */}
          <div 
            className="relative w-full bg-black overflow-hidden"
            style={{
              boxShadow: isActive 
                ? '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px -20px rgba(0,0,0,0.8)'
                : '0 0 0 1px rgba(255,255,255,0.02)',
              transition: 'box-shadow 0.5s ease',
            }}
          >
            <MuxPlayer
              ref={mainPlayerRef}
              playbackId={premiere.mux_playback_id}
              tokens={tokens}
              streamType="on-demand"
              accentColor="#ffffff"
              primaryColor="#ffffff"
              autoPlay
              preload="auto"
              metadata={{ video_title: premiere.title }}
              className="main-mux-player"
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            />
          </div>

          {/* Title */}
          <motion.div
            animate={{ opacity: showUI && !showIntro && !hasEnded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-full mt-5 flex items-center justify-between px-1"
          >
            <div>
              <h1 className="text-base md:text-lg font-normal text-white">
                {premiere.title}
              </h1>
              {premiere.description && (
                <p className="text-sm text-white/70 mt-1">{premiere.description}</p>
              )}
            </div>
            <SurealLogo size="sm" animate={false} className="opacity-50" />
          </motion.div>
        </motion.div>
      </div>

      {/* ============ INTRO ============ */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleStart}
            className="absolute inset-0 z-[10] flex items-center justify-center bg-black cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <SurealLogo size="lg" animate={false} />
              
              <div className="mt-8">
                <ShinyText 
                  delay={0.6}
                  className="text-sm uppercase tracking-[0.3em] text-white/60"
                >
                  Presents
                </ShinyText>
              </div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-16 text-sm text-white/70"
              >
                Tap to begin
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ OUTRO ============ */}
      <AnimatePresence>
        {hasEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute inset-0 z-[10] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col items-center"
            >
              <SurealLogo size="md" animate={false} className="opacity-70" />
              
              <span className="mt-6 text-lg text-white/80">
                {premiere.title}
              </span>
              
              <span className="mt-2 text-xs text-white/60 uppercase tracking-[0.2em]">
                A Sureal Studio Production
              </span>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <Button 
                  variant="outline" 
                  onClick={handleReplay}
                  className="flex items-center gap-2.5"
                >
                  <RotateCcw size={14} strokeWidth={1.5} />
                  <span>Watch Again</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reactions */}
      <FloatingReactions premiereId={premiere.id} enabled={videoState === 'playing'} />
    </div>
  )
}
