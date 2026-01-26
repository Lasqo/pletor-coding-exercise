import { useEffect, useState } from 'react'
import { isPlaceholderImage } from '../utils/imageUtils'
import { PLACEHOLDER_IMAGE_PATH } from '../config/constants'

interface UseImageLoadingProps {
  urlsAreSame: boolean
}

export function useImageLoading({ urlsAreSame }: UseImageLoadingProps) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [fullImageLoaded, setFullImageLoaded] = useState(false)
  const [fullImageError, setFullImageError] = useState(false)
  const [shouldLoadFullImage, setShouldLoadFullImage] = useState(false)
  const [isShowingPlaceholder, setIsShowingPlaceholder] = useState(false)

  useEffect(() => {
    if (urlsAreSame) {
      setShouldLoadFullImage(true)
    }
  }, [urlsAreSame])

  const handleThumbnailLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement
    setThumbnailLoaded(true)
    if (isPlaceholderImage(imgElement.src)) {
      setIsShowingPlaceholder(true)
    }
    if (!urlsAreSame) {
      setTimeout(() => setShouldLoadFullImage(true), 0)
    }
  }

  const handleThumbnailError = () => {
    setThumbnailLoaded(true)
    setThumbnailError(true)
    setShouldLoadFullImage(true)
  }

  const handleFullImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement
    if (!isPlaceholderImage(imgElement.src)) {
      setFullImageLoaded(true)
      setFullImageError(false)
      setIsShowingPlaceholder(false)
      if (urlsAreSame) {
        setThumbnailLoaded(true)
      }
    } else {
      setIsShowingPlaceholder(true)
    }
  }

  const handleFullImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement
    setFullImageError(true)
    imgElement.src = PLACEHOLDER_IMAGE_PATH
    imgElement.style.opacity = '1'
    if (!thumbnailLoaded) {
      setThumbnailLoaded(true)
    }
    if (urlsAreSame || !thumbnailLoaded || thumbnailError) {
      setIsShowingPlaceholder(true)
    }
  }

  return {
    thumbnailLoaded,
    thumbnailError,
    fullImageLoaded,
    fullImageError,
    shouldLoadFullImage,
    isShowingPlaceholder,
    handleThumbnailLoad,
    handleThumbnailError,
    handleFullImageLoad,
    handleFullImageError,
  }
}
