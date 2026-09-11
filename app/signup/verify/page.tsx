import { redirect } from 'next/navigation'

import { VerifyCodeForm } from '@/components/auth/verify-code-form'

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function VerifyPage(props: PageProps<'/signup/verify'>) {
  const params = await props.searchParams
  const customerId = firstValue(params.customerId)
  // No customerId means this wasn't reached from a real signup/login
  // attempt — back to signup rather than rendering a form that can never
  // succeed.
  if (!customerId) redirect('/signup')

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <VerifyCodeForm customerId={customerId} />
    </main>
  )
}
