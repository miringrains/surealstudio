'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from './Button'

interface EmailGateProps {
  premiereId: string
  premiereTitle: string
  isOpen: boolean
  onSuccess: () => void
  onClose: () => void
}

export function EmailGate({ 
  premiereId, 
  premiereTitle,
  isOpen, 
  onSuccess, 
  onClose 
}: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Enter a valid email')
      }

      const supabase = createClient()
      
      const { data: existing } = await supabase
        .from('attendees')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('premiere_id', premiereId)
        .single()

      if (!existing) {
        const { error: insertError } = await supabase
          .from('attendees')
          .insert({
            email: email.toLowerCase(),
            premiere_id: premiereId,
          })

        if (insertError) {
          throw new Error('Failed to register')
        }
      }

      localStorage.setItem(`premiere_${premiereId}_email`, email.toLowerCase())
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-8"
              >
                <Dialog.Close asChild>
                  <button
                    className="absolute top-0 right-0 p-2 text-white/30 hover:text-white/60 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </Dialog.Close>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <span className="label">Enter Premiere</span>
                    <Dialog.Title className="text-xl font-normal text-white/90">
                      {premiereTitle}
                    </Dialog.Title>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        disabled={isLoading}
                        autoFocus
                      />
                      {error && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400/80 text-xs"
                        >
                          {error}
                        </motion.span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-white/20 text-xs text-center">
                    Your email is only used for attendance
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
