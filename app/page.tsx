'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { SurealLogo } from '@/components/SurealLogo'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { EmailGate } from '@/components/ui/EmailGate'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Premiere } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [premiere, setPremiere] = useState<Premiere | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailGate, setShowEmailGate] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

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
    if (hasAccess && premiere) {
      router.push(`/theater/${premiere.id}`)
    }
  }, [hasAccess, premiere, router])

  const handleEnterClick = () => {
    if (hasAccess && premiere) {
      router.push(`/theater/${premiere.id}`)
    } else {
      setShowEmailGate(true)
    }
  }

  const handleGateSuccess = () => {
    setShowEmailGate(false)
    setHasAccess(true)
    if (premiere) {
      router.push(`/theater/${premiere.id}`)
    }
  }

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center p-8">
      {/* Background */}
      <div className="fixed inset-0 bg-black" />
      
      {/* Subtle gradient */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <SurealLogo size="lg" />
        </motion.div>

        {/* Main */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            </motion.div>
          ) : premiere ? (
            <motion.div
              key="premiere"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Info */}
              <div className="flex flex-col items-center gap-3 text-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="label"
                >
                  Next Premiere
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-normal text-white/90"
                >
                  {premiere.title}
                </motion.h1>
                {premiere.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/40 text-sm"
                  >
                    {premiere.description}
                  </motion.p>
                )}
              </div>

              {/* Countdown */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CountdownTimer
                  targetDate={new Date(premiere.scheduled_at)}
                  onComplete={handleCountdownComplete}
                />
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button onClick={handleEnterClick}>
                  {hasAccess ? 'Enter Theater' : 'Get Access'}
                  <ArrowRight size={18} strokeWidth={2} />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <h2 className="text-xl font-normal text-white/90">No upcoming premieres</h2>
              <p className="text-white/40 text-sm">Check back soon</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 text-white/20 text-xs"
      >
        Sureal Studio © {new Date().getFullYear()}
      </motion.footer>

      {/* Email Gate */}
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
