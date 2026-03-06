import type { TargetAndTransition, Transition } from 'framer-motion'

type AnimationKeyframes = Record<
  'animate' | 'exit' | 'initial',
  TargetAndTransition
>

const FADE_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
} as const satisfies AnimationKeyframes

const SCALE_FADE_ANIMATION = {
  initial: { opacity: 0, scale: 0.96, y: 8 },

  animate: { opacity: 1, scale: 1, y: 0 },

  exit: { opacity: 0, scale: 0.96, y: 8 }
} as const satisfies AnimationKeyframes

const OVERLAY_TRANSITION = { duration: 0.3 } as const satisfies Transition

const CONTENT_TRANSITION = { duration: 0.2 } as const satisfies Transition

const MODAL_TRANSITION = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1]
} as const satisfies Transition

export {
  CONTENT_TRANSITION,
  FADE_ANIMATION,
  MODAL_TRANSITION,
  OVERLAY_TRANSITION,
  SCALE_FADE_ANIMATION
}
