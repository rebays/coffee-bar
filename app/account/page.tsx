import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions/customer-auth'
import { getCurrentCustomer } from '@/lib/customers/auth'

export default async function AccountPage() {
  const customer = await getCurrentCustomer()
  if (!customer) redirect('/login')

  return (
    <main
      className="mx-auto flex w-full flex-1 flex-col gap-6 px-gutter py-8"
      style={{ maxInlineSize: 'var(--container-form)' }}
    >
      <h1 className="text-title">Your account</h1>

      <div className="border-hairline rounded-tile flex flex-col gap-1 border p-4">
        <p className="text-item">{customer.fullName}</p>
        <p className="text-body text-secondary">{customer.phone}</p>
      </div>

      <form action={logoutAction}>
        <Button type="submit" variant="secondary" size="md">
          Log out
        </Button>
      </form>
    </main>
  )
}
