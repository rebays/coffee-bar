'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'motion/react'

/**
 * A digit that springs to a new value when it changes — nothing else in the
 * system animates a number outside the cart bar's own count-swap keyframe
 * (see docs/DESIGN-SYSTEM.md §6). Adapted from React Bits' CountUp, trimmed
 * to fit that rule instead of fighting it:
 *
 * - No scroll trigger. Upstream fires on `useInView`, which is exactly the
 *   scroll-triggered reveal §6 bans. This fires only when `value` changes.
 * - No entrance animation. The first render paints the value statically —
 *   it has to look like nothing happened, or it reads as page-load motion.
 * - Reduced motion is checked explicitly. The global CSS override in
 *   globals.css only zeroes `animation`/`transition` durations; it can't
 *   reach a JS-driven spring, so this mirrors the matchMedia check already
 *   used in components/menu/menu-body.tsx.
 */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasMounted = useRef(false)
  const motionValue = useMotionValue(value)
  // Damping/stiffness tuned to settle in roughly --dur-slow (260ms), a quick
  // correction rather than upstream's ~2s lush default.
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 300 })

  useEffect(() => {
    if (ref.current) ref.current.textContent = Intl.NumberFormat('en-US').format(value)
    // Mount-only: paints the initial value once, statically. Later changes
    // are handled by the effect below, not this one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      // Jumping the source alone still triggers a spring toward the new
      // target (attachFollow reacts to "change", not to jump vs set) — so
      // the follower itself has to be jumped too, synchronously, before any
      // frame of that spring can paint.
      motionValue.jump(value)
      springValue.jump(value)
    } else {
      motionValue.set(value)
    }
  }, [value, motionValue, springValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) ref.current.textContent = Intl.NumberFormat('en-US').format(Math.round(latest))
    })
    return () => unsubscribe()
  }, [springValue])

  return <span ref={ref} className={className} />
}
