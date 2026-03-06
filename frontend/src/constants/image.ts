const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const satisfies string[]

const ACCEPTED_IMAGE_INPUT = ACCEPTED_IMAGE_MIME_TYPES.join(',')

const ACCEPTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp'
] as const satisfies string[]

const THUMBNAIL_WIDTH = 400

const THUMBNAIL_QUALITY = 75

type SrcSetWidth = 400 | 800

const SRCSET_WIDTHS = [400, 800] as const satisfies SrcSetWidth[]

const IMAGE_SIZES =
  '(min-width: 1280px) 300px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 48px)'

const PRIORITY_IMAGE_COUNT = 8

const DEFAULT_ASPECT_RATIO = 4 / 3

const MIN_ASPECT_RATIO = 0.6

const MAX_ASPECT_RATIO = 1.5

export {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_INPUT,
  DEFAULT_ASPECT_RATIO,
  IMAGE_SIZES,
  MAX_ASPECT_RATIO,
  MIN_ASPECT_RATIO,
  PRIORITY_IMAGE_COUNT,
  SRCSET_WIDTHS,
  THUMBNAIL_QUALITY,
  THUMBNAIL_WIDTH
}
