'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email')
      }

      const supabase = createClient()
      
      // Check if already registered
      const { data: existing } = await supabase
        .from('attendees')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('premiere_id', premiereId)
        .single()

      if (!existing) {
        // Register new attendee
        const { error: insertError } = await supabase
          .from('attendees')
          .insert({
            email: email.toLowerCase(),
            premiere_id: premiereId,
          })

        if (insertError) {
          throw new Error('Failed to register. Please try again.')
        }
      }

      // Store in localStorage for session persistence
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
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-8 glass rounded-none"
              >
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 p-2 text-white-muted hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>

                <div className="flex flex-col gap-8">
                  {/* Header */}
                  <div className="flex flex-col gap-2">
                    <span className="text-label">Enter the Premiere</span>
                    <Dialog.Title className="text-2xl font-light tracking-tight">
                      {premiereTitle}
                    </Dialog.Title>
                    <Dialog.Description className="text-white-muted text-sm">
                      Enter your email to access the viewing experience.
                    </Dialog.Description>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full"
                        disabled={isLoading}
                        autoFocus
                      />
                      {error && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs text-mono"
                        >
                          {error}
                        </motion.span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className={cn(
                        'btn w-full',
                        isLoading && 'opacity-50 cursor-wait'
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Enter Premiere</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <p className="text-white-dim text-xs text-center">
                    Your email will only be used to track attendance.
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
