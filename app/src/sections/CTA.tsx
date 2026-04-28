import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Flame, Loader2, Check, X } from 'lucide-react'
import { api } from '@/lib/api'

export default function CTA() {
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isReserving, setIsReserving] = useState(false)
  const [availability, setAvailability] = useState<{ available: boolean; message?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showEmailInput, setShowEmailInput] = useState(false)

  const checkAvailability = useCallback(async () => {
    if (!handle || handle.length < 3) {
      setError('العنوان يجب أن يكون 3 أحرف على الأقل')
      return
    }

    setIsChecking(true)
    setError(null)
    setAvailability(null)

    try {
      const result = await api.checkHandle(handle)
      setAvailability(result)
      if (result.available) {
        setShowEmailInput(true)
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في التحقق')
    } finally {
      setIsChecking(false)
    }
  }, [handle])

  const reserveHandle = useCallback(async () => {
    if (!handle || !email) return

    setIsReserving(true)
    setError(null)

    try {
      const result = await api.reserveHandle(handle, email)
      setSuccess(result.message)
      setShowEmailInput(false)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الحجز')
    } finally {
      setIsReserving(false)
    }
  }, [handle, email])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!availability?.available) {
      checkAvailability()
    } else if (showEmailInput && email) {
      reserveHandle()
    }
  }

  return (
    <section className="relative py-24 overflow-hidden bg-[#fafaf9]">
      {/* Left gradient cone */}
      <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-[500px] h-[700px] pointer-events-none"
        style={{
          background: 'conic-gradient(from 200deg at 50% 50%, #ff9a56 0deg, #ff6b9d 40deg, #c084fc 80deg, transparent 120deg)',
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
      />
      
      {/* Right gradient cone */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[700px] pointer-events-none"
        style={{
          background: 'conic-gradient(from 340deg at 50% 50%, #60a5fa 0deg, #818cf8 40deg, #c084fc 80deg, transparent 120deg)',
          filter: 'blur(60px)',
          opacity: 0.6,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          احصل على عنوان عاملك المجاني
        </h2>
        <p className="text-gray-500 mb-10 max-w-lg mx-auto">
          بروتوكول مفتوح. يعمل مع أي عامل. ادعِلِل عنوانك قبل أن يفعله شخص آخر.
        </p>

        {/* CTA Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-4 space-y-3">
          {/* Handle Input */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative w-full">
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 shadow-sm transition-all ${
                availability?.available 
                  ? 'border-green-400 ring-1 ring-green-200' 
                  : availability?.available === false
                  ? 'border-red-400 ring-1 ring-red-200'
                  : 'border-gray-300 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400'
              }`}>
                <span className="text-gray-900 font-semibold text-sm ml-2">wakalat.ai/@</span>
                <Input
                  value={handle}
                  onChange={e => {
                    setHandle(e.target.value)
                    setAvailability(null)
                    setError(null)
                  }}
                  placeholder="اسمك"
                  className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-right p-0 h-auto text-sm"
                  disabled={isChecking || isReserving}
                />
                {/* Status indicator */}
                {availability?.available && <Check className="w-4 h-4 text-green-500 mr-2" />}
                {availability?.available === false && <X className="w-4 h-4 text-red-500 mr-2" />}
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 h-auto rounded-xl text-sm font-semibold shrink-0"
              disabled={isChecking || isReserving || (availability?.available === false)}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحقق...
                </>
              ) : isReserving ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحجز...
                </>
              ) : availability?.available ? (
                'تأكيد الحجز'
              ) : (
                'احصل على عنوان مجاني'
              )}
            </Button>
          </div>

          {/* Email Input (shown after availability check) */}
          {showEmailInput && availability?.available && (
            <div className="w-full animate-in slide-in-from-top-2 duration-300">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="w-full text-right border-gray-300 rounded-xl px-4 py-3"
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-right">
                سيتم حجز العنوان لمدة 10 دقائق. ستصلك رسالة تأكيد.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-right">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-right">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-amber-700">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>العناوين القصيرة تنتهي بسرعة — ادعِلِل عنوانك الآن</span>
        </div>
      </div>
    </section>
  )
}
