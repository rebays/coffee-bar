'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { loginAction } from '@/lib/actions/customer-auth'

const ERROR_COPY: Record<string, string> = {
  invalid_credentials: "That phone number or password isn't right.",
}

export function LoginForm() {
  const [result, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="flex flex-col gap-4 px-gutter py-8">
      <h1 className="text-title">Log in</h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-item">
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+677 7XXXXXX"
          required
          className="border-hairline rounded-input text-body border p-3"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-item">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-hairline rounded-input text-body border p-3"
        />
      </div>

      {result && !result.ok ? <p className="text-danger-text text-small">{ERROR_COPY[result.error]}</p> : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </Button>

      <Link href="/signup" className="text-accent text-body text-center font-semibold">
        New here? Create an account
      </Link>
    </form>
  )
}
