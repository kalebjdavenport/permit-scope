"use client"

import { useRef } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  type UseInViewOptions,
  type Variants
} from "motion/react"

type BlurFadeProps = {
  children: React.ReactNode
  className?: string
  variant?: { hidden: { y: number }; visible: { y: number } }
  duration?: number
  delay?: number
  offset?: number
  direction?: "up" | "down" | "left" | "right"
  inView?: boolean
  inViewMargin?: UseInViewOptions["margin"]
  blur?: string
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px"
}: BlurFadeProps) {
  const ref = useRef(null)
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin })
  const isInView = !inView || inViewResult

  const directionOffset = direction === "up" || direction === "left" ? -offset : offset
  const axis = direction === "up" || direction === "down" ? "y" : "x"

  const defaultVariants: Variants = {
    hidden: { [axis]: directionOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" }
  }

  const combined = variant || defaultVariants

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combined}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
