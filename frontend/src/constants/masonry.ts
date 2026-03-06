const MASONRY_GAP = 12

const MASONRY_CARD_PADDING = 0

const SKELETON_HEIGHTS = [
  180, 240, 200, 260, 220, 190, 250, 210, 230, 200, 240, 180
] as const satisfies number[]

type MasonryBreakpoint = {
  minWidth: number
  columns: number
}

const MASONRY_BREAKPOINTS = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 }
] as const satisfies MasonryBreakpoint[]

export {
  MASONRY_BREAKPOINTS,
  MASONRY_CARD_PADDING,
  MASONRY_GAP,
  SKELETON_HEIGHTS
}
