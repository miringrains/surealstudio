'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { RotateCcw } from 'lucide-react'
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
  const [showUI, setShowUI] = useState(true)

  // Thumbnail for static ambient fallback
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
      
      {/* ============ AMBIENT GLOW LAYER ============ */}
      {/* Static thumbnail blur as base layer */}
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

      {/* Dynamic video glow layer */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        animate={{ opacity: hasEnded ? 0 : isActive ? 0.6 : 0.3 }}
        transition={{ duration: 1.5 }}
        style={{
          filter: 'blur(100px) saturate(1.5)',
          transform: 'scale(1.4)',
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
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            '--controls': 'none',
            '--media-object-fit': 'cover',
          } as React.CSSProperties}
        />
      </motion.div>

      {/* ============ VIGNETTE ============ */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: hasEnded
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 100%)'
            : 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* ============ MAIN VIDEO ============ */}
      <div className="relative z-[3] flex items-center justify-center min-h-[100dvh] px-4 py-8 md:px-12 md:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ 
            opacity: hasEnded ? 0.6 : 1,
            scale: hasEnded ? 0.94 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl"
        >
          {/* Video container with subtle shadow */}
          <div 
            className="relative bg-black"
            style={{
              boxShadow: isActive 
                ? '0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px -20px rgba(0,0,0,0.8)'
                : '0 0 0 1px rgba(255,255,255,0.03)'
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
              style={{
                width: '100%',
                '--media-object-fit': 'contain',
              } as React.CSSProperties}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
            />
          </div>

          {/* Title bar */}
          <motion.div
            animate={{ opacity: showUI && !showIntro && !hasEnded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 flex items-center justify-between"
          >
            <div>
              <h1 className="text-base md:text-lg font-normal text-white/80 tracking-tight">
                {premiere.title}
              </h1>
              {premiere.description && (
                <p className="text-sm text-white/30 mt-0.5">{premiere.description}</p>
              )}
            </div>
            <SurealLogo size="sm" animate={false} className="opacity-30" />
          </motion.div>
        </motion.div>
      </div>

      {/* ============ INTRO OVERLAY ============ */}
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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <SurealLogo size="lg" animate={false} />
              
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/40"
              >
                Presents
              </motion.span>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                transition={{ delay: 1.5 }}
                className="mt-12 text-[11px] text-white/25"
              >
                Tap to begin
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ OUTRO OVERLAY ============ */}
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
              <SurealLogo size="md" animate={false} className="opacity-50" />
              
              <span className="mt-6 text-sm text-white/40 tracking-tight">
                {premiere.title}
              </span>
              
              <span className="mt-1 text-[10px] text-white/20 uppercase tracking-[0.15em]">
                A Sureal Studio Production
              </span>

              {/* Replay button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleReplay}
                className="mt-10 flex items-center gap-2.5 px-5 py-2.5 text-white/50 hover:text-white/80 border border-white/10 hover:border-white/25 transition-all duration-300"
              >
                <RotateCcw size={13} strokeWidth={1.5} />
                <span className="text-[11px] tracking-wide">Watch again</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ REACTIONS ============ */}
      <FloatingReactions premiereId={premiere.id} enabled={videoState === 'playing'} />
    </div>
  )
}
