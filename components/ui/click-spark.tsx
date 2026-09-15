'use client'

import { useCallback, useEffect, useRef } from 'react'

type Spark = { x: number; y: number; angle: number; startTime: number }

/**
 * A burst of lines radiating from the tap point — adapted from React Bits'
 * ClickSpark, fired only by a click (see docs/DESIGN-SYSTEM.md §6's "motion
 * answers actions" rule and the CountUp exception it already documents).
 * Two changes from upstream:
 *
 * - The render loop only runs while a spark is animating. Upstream's
 *   `requestAnimationFrame` reschedules itself unconditionally forever, which
 *   means every page holding this component burns a frame callback even when
 *   nobody has tapped — exactly the kind of always-on cost §6 is written to
 *   avoid on mid-range phones. This starts the loop on the first click and
 *   lets it end once the canvas is empty again.
 * - `prefers-reduced-motion: reduce` skips the effect entirely (upstream has
 *   no such check) and the spark colour is read from the wrapped element's
 *   own computed text colour, so it's correct on both the light and dark
 *   accent stop without a colour prop to keep in sync.
 */
export function ClickSpark({
  children,
  className,
  sparkSize = 8,
  sparkRadius = 16,
  sparkCount = 6,
  duration = 350,
}: {
  children: React.ReactNode
  className?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const animatingRef = useRef(false)
  // Holds the latest `draw` so the rAF loop below can call back into itself
  // without closing over the `const` directly — a self-referencing useCallback
  // trips react-hooks/immutability, since the in-flight closure and the
  // reassigned binding are, statically, two different things.
  const drawRef = useRef<(timestamp: number) => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const resize = () => {
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = getComputedStyle(canvas.parentElement ?? canvas).color
      ctx.lineWidth = 2

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime
        if (elapsed >= duration) return false

        const progress = elapsed / duration
        const eased = progress * (2 - progress) // ease-out
        const distance = eased * sparkRadius
        const lineLength = sparkSize * (1 - eased)

        const x1 = spark.x + distance * Math.cos(spark.angle)
        const y1 = spark.y + distance * Math.sin(spark.angle)
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle)
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        return true
      })

      if (sparksRef.current.length > 0) {
        requestAnimationFrame(drawRef.current)
      } else {
        animatingRef.current = false
      }
    },
    [duration, sparkRadius, sparkSize],
  )

  useEffect(() => {
    drawRef.current = draw
  }, [draw])

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const now = performance.now()

    sparksRef.current.push(
      ...Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
      })),
    )

    if (!animatingRef.current) {
      animatingRef.current = true
      requestAnimationFrame(drawRef.current)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={['relative', className].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'block' }}
      />
      {children}
    </div>
  )
}
