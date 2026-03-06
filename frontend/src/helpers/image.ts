import {
  DEFAULT_ASPECT_RATIO,
  MAX_ASPECT_RATIO,
  MIN_ASPECT_RATIO,
  SRCSET_WIDTHS,
  THUMBNAIL_QUALITY,
  THUMBNAIL_WIDTH
} from '../constants/image'

const getImageAspectRatio = (url: string) => {
  try {
    const params = new URL(url).searchParams
    const width = Number(params.get('w'))
    const height = Number(params.get('h'))

    if (width > 0 && height > 0) {
      return Math.min(
        MAX_ASPECT_RATIO,
        Math.max(MIN_ASPECT_RATIO, height / width)
      )
    }

    return DEFAULT_ASPECT_RATIO
  } catch {
    return DEFAULT_ASPECT_RATIO
  }
}

type BuildOptimizedUrlParams = {
  url: string
  width: number
  quality: number
}

const buildOptimizedUrl = ({
  url,
  width,
  quality
}: BuildOptimizedUrlParams) => {
  const parsed = new URL(url)
  const ratio = getImageAspectRatio(url)
  const height = Math.round(width * ratio)

  parsed.searchParams.set('w', String(width))
  parsed.searchParams.set('h', String(height))
  parsed.searchParams.set('q', String(quality))
  parsed.searchParams.set('auto', 'format')

  return parsed.toString()
}

const getOptimizedImageUrl = (url: string) => {
  try {
    return buildOptimizedUrl({
      url,
      width: THUMBNAIL_WIDTH,
      quality: THUMBNAIL_QUALITY
    })
  } catch {
    return url
  }
}

const getImageSrcSet = (url: string) => {
  try {
    return SRCSET_WIDTHS.map((width) => {
      return `${buildOptimizedUrl({ url, width, quality: THUMBNAIL_QUALITY })} ${String(width)}w`
    }).join(', ')
  } catch {
    return ''
  }
}

const getImageDimensions = (url: string) => {
  const ratio = getImageAspectRatio(url)

  return {
    width: THUMBNAIL_WIDTH,
    height: Math.round(THUMBNAIL_WIDTH * ratio)
  }
}

export {
  getImageAspectRatio,
  getImageDimensions,
  getImageSrcSet,
  getOptimizedImageUrl
}
