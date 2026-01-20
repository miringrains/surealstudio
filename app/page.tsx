'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SurealLogo } from '@/components/SurealLogo'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { EmailGate } from '@/components/ui/EmailGate'
import { createClient } from '@/lib/supabase/client'
import type { Premiere } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [premiere, setPremiere] = useState<Premiere | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailGate, setShowEmailGate] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  // Fetch the next premiere
  useEffect(() => {
    async function fetchPremiere() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('premieres')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()

      if (!error && data) {
        setPremiere(data)
        
        // Check if user already has access
        const storedEmail = localStorage.getItem(`premiere_${data.id}_email`)
        if (storedEmail) {
          setHasAccess(true)
        }
      }
      
      setIsLoading(false)
    }

    fetchPremiere()
  }, [])

  const handleCountdownComplete = useCallback(() => {
    // Premiere is live - can navigate if user has access
    if (hasAccess && premiere) {
      router.push(`/theater/${premiere.id}`)
    }
  }, [hasAccess, premiere, router])

  const handleEnterClick = () => {
    if (hasAccess && premiere) {
      // Go directly to theater (bypass countdown for demo)
      router.push(`/theater/${premiere.id}`)
    } else {
      setShowEmailGate(true)
    }
  }

  const handleGateSuccess = () => {
    setShowEmailGate(false)
    setHasAccess(true)
    
    // Go directly to theater after email entry (bypass countdown for demo)
    if (premiere) {
      router.push(`/theater/${premiere.id}`)
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-black to-zinc-950/50" />
      
      {/* Subtle grid pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-16 max-w-4xl w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <SurealLogo size="lg" />
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-8 h-8 border border-white/20 border-t-white/80 rounded-full animate-spin" />
              <span className="text-label">Loading</span>
            </motion.div>
          ) : premiere ? (
            <motion.div
              key="premiere"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-12"
            >
              {/* Premiere info */}
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-label"
                >
                  Next Premiere
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-light tracking-tight"
                >
                  {premiere.title}
                </motion.h1>
                {premiere.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white-muted max-w-md"
                  >
                    {premiere.description}
                  </motion.p>
                )}
              </div>

              {/* Countdown */}
              <CountdownTimer
                targetDate={new Date(premiere.scheduled_at)}
                onComplete={handleCountdownComplete}
              />

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleEnterClick}
                  className="btn group"
                >
                  <span>{hasAccess ? 'Enter Theater' : 'Get Access'}</span>
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </button>
              </motion.div>

              {/* Access indicator */}
              {hasAccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2 text-white-muted text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-mono">Access Granted</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-premiere"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <h1 className="text-2xl md:text-4xl font-light tracking-tight">
                No Upcoming Premieres
              </h1>
              <p className="text-white-muted max-w-md">
                Check back soon for the next drop.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-8 text-label"
      >
        Sureal Studio © {new Date().getFullYear()}
      </motion.footer>

      {/* Email Gate Modal */}
      {premiere && (
        <EmailGate
          premiereId={premiere.id}
          premiereTitle={premiere.title}
          isOpen={showEmailGate}
          onSuccess={handleGateSuccess}
          onClose={() => setShowEmailGate(false)}
        />
      )}
    </main>
  )
}
