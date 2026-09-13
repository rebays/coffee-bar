'use client'

import { useActionState, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { resendCodeAction, verifyCodeAction } from '@/lib/actions/customer-auth'

const VERIFY_ERROR_COPY: Record<string, string> = {
  invalid_or_expired: 'That code is incorrect or has expired.',
  too_many_attempts: 'Too many attempts — request a new code below.',
  not_found: 'We could not find that account.',
}

const RESEND_ERROR_COPY: Record<string, string> = {
  already_verified: 'This account is already verified.',
  not_found: 'We could not find that account.',
}

// Mirrors lib/customers/verification.ts's RESEND_COOLDOWN_SECONDS — only for
// the client-side countdown display; the server enforces the real cooldown
// regardless of what this shows.
const RESEND_COOLDOWN_SECONDS = 60

export function VerifyCodeForm({ customerId }: { customerId: string }) {
  const [verifyResult, verifyFormAction, verifying] = useActionState(verifyCodeAction, null)
  const [resendResult, resendFormAction, resending] = useActionState(resendCodeAction, null)
  const [cooldown, setCooldown] = useState(0)

  // Adjusted during render (React's own recommended alternative to a
  // setState-in-effect) via a previous-result comparison — the countdown
  // starts the moment a new resendResult arrives, not one render later.
  const [previousResendResult, setPreviousResendResult] = useState(resendResult)
  if (resendResult !== previousResendResult) {
    setPreviousResendResult(resendResult)
    if (resendResult && !resendResult.ok && resendResult.error === 'cooldown') {
      setCooldown(resendResult.secondsRemaining)
    } else if (resendResult?.ok) {
      setCooldown(RESEND_COOLDOWN_SECONDS)
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  return (
    <div className="flex flex-col gap-6 px-gutter py-8">
      <div>
        <h1 className="text-title">Verify your account</h1>
        <p className="text-body text-secondary mt-1">Enter the code we sent you.</p>
      </div>

      <form action={verifyFormAction} className="flex flex-col gap-4">
        <input type="hidden" name="customerId" value={customerId} />
        <div className="flex flex-col gap-2">
          <label htmlFor="code" className="text-item">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="border-hairline rounded-input text-body border p-3 text-center tracking-widest"
          />
        </div>
        {verifyResult && !verifyResult.ok ? (
          <p className="text-danger-text text-small">{VERIFY_ERROR_COPY[verifyResult.error]}</p>
        ) : null}
        <Button type="submit" size="lg" block disabled={verifying}>
          {verifying ? 'Verifying…' : 'Verify'}
        </Button>
      </form>

      <form action={resendFormAction} className="flex flex-col gap-2">
        <input type="hidden" name="customerId" value={customerId} />
        {resendResult && !resendResult.ok && resendResult.error !== 'cooldown' ? (
          <p className="text-danger-text text-small">{RESEND_ERROR_COPY[resendResult.error]}</p>
        ) : null}
        {resendResult?.ok ? (
          <p className="text-small text-secondary">
            {resendResult.sent ? 'A new code is on its way.' : "That didn't send — try again shortly."}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" size="md" disabled={resending || cooldown > 0}>
          {cooldown > 0 ? `Resend code (${cooldown}s)` : resending ? 'Sending…' : 'Resend code'}
        </Button>
      </form>
    </div>
  )
}
