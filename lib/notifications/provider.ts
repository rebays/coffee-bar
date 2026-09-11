/**
 * Mirrors lib/payments/provider.ts's shape deliberately — this app already
 * has one established pattern for "an external service this app talks to,
 * swappable behind one interface, with a registry deciding which
 * implementation answers at runtime." Verification-code delivery is exactly
 * that kind of thing, so it gets the same shape rather than a new one.
 */
export type NotificationChannel = 'email' | 'phone'

export interface NotificationProvider {
  readonly channel: NotificationChannel

  /** Must not throw for a merely-slow downstream provider — see each implementation's own error handling. */
  sendVerificationCode(to: string, code: string): Promise<void>
}
