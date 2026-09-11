import { redirect } from 'next/navigation'

import { SignupForm } from '@/components/auth/signup-form'
import { getCurrentCustomer } from '@/lib/customers/auth'

export default async function SignupPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect('/account')

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <SignupForm />
    </main>
  )
}
