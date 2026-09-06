'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { staffLoginAction } from '@/lib/actions/staff-auth'

const ERROR_COPY: Record<string, string> = {
  missing_name: 'Enter your name.',
  invalid_passcode: "That passcode isn't right.",
}

export function StaffLoginForm() {
  const [result, formAction, pending] = useActionState(staffLoginAction, null)

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full flex-col gap-4 px-gutter py-8"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <h1 className="text-title">Staff sign in</h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="staffName" className="text-item">
          Your name
        </label>
        <input
          id="staffName"
          name="staffName"
          type="text"
          autoComplete="off"
          required
          className="border-hairline rounded-tile text-body border p-3"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="passcode" className="text-item">
          Passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="off"
          required
          className="border-hairline rounded-tile text-body border p-3"
        />
      </div>

      {result && !result.ok ? (
        <p className="text-danger-text text-small">{ERROR_COPY[result.error]}</p>
      ) : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
