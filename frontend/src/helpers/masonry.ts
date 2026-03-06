import { MASONRY_BREAKPOINTS, MASONRY_CARD_PADDING } from '../constants/masonry'
import { getImageAspectRatio } from './image'

type GetImageEstimatedHeightParams = {
  url: string
  columnWidth: number
}

const getImageEstimatedHeight = ({
  url,
  columnWidth
}: GetImageEstimatedHeightParams) => {
  const aspectRatio = getImageAspectRatio(url)
  const imageHeight = Math.round(columnWidth * aspectRatio)

  return imageHeight + MASONRY_CARD_PADDING
}

const getColumnsForWidth = (width: number) => {
  for (const breakpoint of MASONRY_BREAKPOINTS) {
    if (width >= breakpoint.minWidth) {
      return breakpoint.columns
    }
  }

  return 1
}

export { getColumnsForWidth, getImageEstimatedHeight }
