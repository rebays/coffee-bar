import twilio from 'twilio'

import type { NotificationProvider } from './provider.ts'

/**
 * Only ever constructed by the registry once all three Twilio env vars are
 * present — see lib/notifications/registry.ts. `to` is expected in E.164
 * form; lib/validation/contact.ts is deliberately permissive about what a
 * customer can type in, so the caller (lib/customers/store.ts) is
 * responsible for getting it into a dialable shape before it reaches here.
 *
 * Coverage note: Twilio's reach into Solomon Islands (+677) numbers should
 * be confirmed against your Twilio account before relying on this in
 * production — some routes/pricing vary by destination and this hasn't
 * been verified against a live account from here.
 */
export function twilioSmsProvider(accountSid: string, authToken: string, fromNumber: string): NotificationProvider {
  const client = twilio(accountSid, authToken)

  return {
    channel: 'phone',
    async sendVerificationCode(to, code) {
      await client.messages.create({
        to,
        from: fromNumber,
        body: `Your Coffee Bar verification code is ${code}. It expires in 10 minutes.`,
      })
    },
  }
}
