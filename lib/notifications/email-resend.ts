import { Resend } from 'resend'

import type { NotificationProvider } from './provider.ts'

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS ?? 'Coffee Bar <onboarding@resend.dev>'

/**
 * Only ever constructed by the registry once RESEND_API_KEY is present —
 * see lib/notifications/registry.ts. Resend's `send` resolves with
 * `{ data, error }` rather than throwing, so a delivery failure is
 * surfaced as a thrown Error here, at this boundary, rather than leaking
 * the provider's own response shape up to the signup/resend action.
 */
export function resendEmailProvider(apiKey: string): NotificationProvider {
  const resend = new Resend(apiKey)

  return {
    channel: 'email',
    async sendVerificationCode(to, code) {
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject: 'Your verification code',
        text: `Your Coffee Bar verification code is ${code}. It expires in 10 minutes.`,
      })
      if (error) {
        throw new Error(`Failed to send verification email: ${error.message}`)
      }
    },
  }
}
