import { consoleProvider } from './console.ts'
import { resendEmailProvider } from './email-resend.ts'
import type { NotificationChannel, NotificationProvider } from './provider.ts'
import { twilioSmsProvider } from './sms-twilio.ts'

/**
 * Mirrors lib/payments/registry.ts: one place deciding which concrete
 * provider answers for a channel. Unlike payments (where CounterProvider is
 * always real, from day one), notifications default to the console
 * provider until real credentials exist — there's no equivalent of "cash at
 * the counter" for email/SMS, so local dev and an unconfigured deployment
 * both fall back to logging the code instead of failing outright.
 */
export function getNotificationProvider(channel: NotificationChannel): NotificationProvider {
  if (channel === 'email') {
    const apiKey = process.env.RESEND_API_KEY
    return apiKey ? resendEmailProvider(apiKey) : consoleProvider('email')
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER
  return accountSid && authToken && fromNumber
    ? twilioSmsProvider(accountSid, authToken, fromNumber)
    : consoleProvider('phone')
}
