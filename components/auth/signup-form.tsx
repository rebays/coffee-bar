'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { signUpAction } from '@/lib/actions/customer-auth'

const DUPLICATE_ERROR = 'An account with that phone number already exists. Try logging in instead.'

export function SignupForm() {
  const [result, formAction, pending] = useActionState(signUpAction, null)

  const fieldErrors = result && !result.ok && 'fieldErrors' in result ? result.fieldErrors : undefined
  const duplicate = result && !result.ok && 'error' in result && result.error === 'duplicate'

  return (
    <form action={formAction} className="flex flex-col gap-4 px-gutter py-8">
      <h1 className="text-title">Create an account</h1>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-item">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className="border-hairline rounded-tile text-body border p-3"
        />
        {fieldErrors?.fullName ? <p className="text-danger-text text-small">{fieldErrors.fullName}</p> : null}
      </div>

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
          className="border-hairline rounded-tile text-body border p-3"
        />
        {fieldErrors?.phone ? <p className="text-danger-text text-small">{fieldErrors.phone}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-item">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="border-hairline rounded-tile text-body border p-3"
        />
        {fieldErrors?.password ? <p className="text-danger-text text-small">{fieldErrors.password}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className="text-item">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="border-hairline rounded-tile text-body border p-3"
        />
        {fieldErrors?.confirmPassword ? (
          <p className="text-danger-text text-small">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      {duplicate ? <p className="text-danger-text text-small">{DUPLICATE_ERROR}</p> : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>

      <Link href="/login" className="text-accent text-body text-center font-semibold">
        Already have an account? Log in
      </Link>
    </form>
  )
}
