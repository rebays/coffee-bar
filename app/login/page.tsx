import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { getCurrentCustomer } from '@/lib/customers/auth'

export default async function LoginPage() {
  const customer = await getCurrentCustomer()
  if (customer) redirect('/account')

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <LoginForm />
    </main>
  )
}
