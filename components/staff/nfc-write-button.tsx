'use client'

import { Nfc } from 'lucide-react'
import { useRef, useState, useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

/**
 * The slice of the Web NFC API this uses. Not in TypeScript's DOM lib yet —
 * Web NFC ships only in Chrome on Android — so it's typed locally rather than
 * declared globally.
 */
type NdefWriter = {
  write(
    message: { records: Array<{ recordType: 'url'; data: string }> },
    options?: { signal?: AbortSignal },
  ): Promise<void>
}
type NdefWriterConstructor = new () => NdefWriter

function getNdefWriter(): NdefWriterConstructor | undefined {
  return (window as unknown as { NDEFReader?: NdefWriterConstructor }).NDEFReader
}

const noSubscription = () => () => {}

/**
 * Whether this browser can write NFC tags at all. useSyncExternalStore so the
 * server snapshot ("no") never mismatches hydration; the real check runs once
 * the client takes over. Web NFC also needs a secure context (https or
 * localhost), which the constructor check covers — it's absent otherwise.
 */
export function useNfcWriteSupported(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => typeof getNdefWriter() === 'function',
    () => false,
  )
}

type WriteState =
  | { status: 'idle' }
  | { status: 'waiting' }
  | { status: 'done' }
  | { status: 'error'; message: string }

/** What happened, and what to do — per docs/CLAUDE.md, no apologies. */
function messageFor(error: unknown): string | null {
  const name = error instanceof DOMException ? error.name : ''
  switch (name) {
    case 'AbortError':
      return null // the staff member pressed Cancel
    case 'NotAllowedError':
      return 'NFC permission was denied. Allow NFC for this site in Chrome’s site settings, then try again.'
    case 'NotSupportedError':
      return 'This tag can’t hold a link. Use a blank NTAG213, NTAG215 or NTAG216 sticker.'
    case 'NetworkError':
      return 'The tag moved away before writing finished. Hold the phone still against it and try again.'
    case 'NotReadableError':
      return 'NFC is turned off on this phone. Turn it on in Android settings, then try again.'
    default:
      return 'The tag wasn’t written. Check NFC is on, then try again with the phone held still against the tag.'
  }
}

/**
 * Writes a table's menu link to an NFC sticker, so a customer can tap
 * instead of scanning. The same URL the table's QR code holds — phones open
 * a URL record straight in the browser, no app needed.
 *
 * Renders nothing where Web NFC isn't available (anything but Chrome on
 * Android), rather than a button that can only fail.
 */
export function NfcWriteButton({ url, label }: { url: string; label: string }) {
  const supported = useNfcWriteSupported()
  const [state, setState] = useState<WriteState>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  if (!supported) return null

  async function write() {
    const Writer = getNdefWriter()
    if (!Writer) return
    const controller = new AbortController()
    abortRef.current = controller
    setState({ status: 'waiting' })
    try {
      await new Writer().write({ records: [{ recordType: 'url', data: url }] }, { signal: controller.signal })
      setState({ status: 'done' })
    } catch (error) {
      const message = messageFor(error)
      setState(message ? { status: 'error', message } : { status: 'idle' })
    } finally {
      abortRef.current = null
    }
  }

  function cancel() {
    abortRef.current?.abort()
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {state.status === 'waiting' ? (
        <Button variant="secondary" size="sm" block onClick={cancel}>
          Cancel
        </Button>
      ) : (
        <Button variant="secondary" size="sm" block onClick={write} aria-label={`Write table ${label} to an NFC tag`}>
          <Nfc size={16} strokeWidth={1.75} aria-hidden="true" />
          {state.status === 'done' ? 'Write another tag' : 'Write NFC tag'}
        </Button>
      )}
      <p className="text-small text-secondary min-h-5 text-center" aria-live="polite">
        {state.status === 'waiting'
          ? 'Hold the back of this phone against the tag…'
          : state.status === 'done'
            ? `Tag written for table ${label}. Tap it with a phone to check.`
            : state.status === 'error'
              ? state.message
              : ''}
      </p>
    </div>
  )
}
