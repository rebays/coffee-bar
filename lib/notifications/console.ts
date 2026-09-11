import type { NotificationChannel, NotificationProvider } from './provider.ts'

/**
 * The default provider whenever no real email/SMS credentials are
 * configured — signup and verification are fully usable in local dev with
 * zero external accounts, the same way CounterProvider needs no real
 * payment gateway. The code lands in the server console instead of an
 * inbox or a phone.
 */
export function consoleProvider(channel: NotificationChannel): NotificationProvider {
  return {
    channel,
    async sendVerificationCode(to, code) {
      console.log(`[notifications:${channel}] verification code for ${to}: ${code}`)
    },
  }
}
