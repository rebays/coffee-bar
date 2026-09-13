'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { staffLoginAction } from '@/lib/actions/staff-auth'

const ERROR_COPY: Record<string, string> = {
  missing_name: 'Enter your name.',
  invalid_passcode: "That passcode isn't right.",
}

/**
 * Shared by every staff-gated page (/staff, /kitchen) — `returnTo` is what
 * sends a successful sign-in back to whichever one rendered this form,
 * instead of always landing on /staff regardless of where you started.
 */
export function StaffLoginForm({ returnTo = '/staff' }: { returnTo?: '/staff' | '/kitchen' }) {
  const [result, formAction, pending] = useActionState(staffLoginAction, null)

  return (
    <main
      data-surface="staff"
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <form action={formAction} className="flex flex-col gap-4 px-gutter py-8">
        <h1 className="text-title">Staff sign in</h1>
        <input type="hidden" name="returnTo" value={returnTo} />

        <div className="flex flex-col gap-2">
          <label htmlFor="staffName" className="text-item">
            Your name
          </label>
          <input
            id="staffName"
            name="staffName"
            type="text"
            autoComplete="name"
            required
            className="border-hairline rounded-input text-body border p-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="passcode" className="text-item">
            Passcode
          </label>
          {/* autoComplete="off" here would block password managers (WCAG 3.3.8) —
              current-password lets one offer to fill/save the shared passcode. */}
          <input
            id="passcode"
            name="passcode"
            type="password"
            autoComplete="current-password"
            required
            className="border-hairline rounded-input text-body border p-3"
          />
        </div>

        {result && !result.ok ? (
          <p className="text-danger-text text-small">{ERROR_COPY[result.error]}</p>
        ) : null}

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  )
}
