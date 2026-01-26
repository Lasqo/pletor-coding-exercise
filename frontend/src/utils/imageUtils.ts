export const getAspectRatio = (url: string): number | null => {
  if (url.includes('unsplash.com')) {
    try {
      const urlObj = new URL(url)
      const width = urlObj.searchParams.get('w')
      const height = urlObj.searchParams.get('h')
      if (width && height) {
        const w = parseInt(width, 10)
        const h = parseInt(height, 10)
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
          return w / h
        }
      }
    } catch {
      return null
    }
  }
  return null
}

export const getThumbnailUrl = (url: string, maxDimension = 400): string => {
  try {
    if (url.includes('unsplash.com')) {
      const urlObj = new URL(url)
      const existingWidth = urlObj.searchParams.get('w')
      const existingHeight = urlObj.searchParams.get('h')
      
      if (existingWidth && existingHeight) {
        const width = parseInt(existingWidth, 10)
        const height = parseInt(existingHeight, 10)
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
          urlObj.searchParams.set('w', maxDimension.toString())
          urlObj.searchParams.set('h', maxDimension.toString())
        } else {
          const aspectRatio = width / height
          
          if (width <= maxDimension && height <= maxDimension) {
            return url
          }
          
          let newWidth: number
          let newHeight: number
          
          if (width > height) {
            newWidth = Math.min(width, maxDimension)
            newHeight = Math.round(newWidth / aspectRatio)
          } else {
            newHeight = Math.min(height, maxDimension)
            newWidth = Math.round(newHeight * aspectRatio)
          }
          
          urlObj.searchParams.set('w', newWidth.toString())
          urlObj.searchParams.set('h', newHeight.toString())
        }
      } else {
        urlObj.searchParams.set('w', maxDimension.toString())
        urlObj.searchParams.set('h', maxDimension.toString())
      }
      
      urlObj.searchParams.set('fit', 'crop')
      urlObj.searchParams.set('q', '80')
      return urlObj.toString()
    }
    
    if (url.includes('/uploads/')) {
      const filename = url.split('/uploads/')[1]
      if (filename) {
        const baseUrl = url.split('/uploads/')[0]
        return `${baseUrl}/thumbnails/thumb_${filename}`
      }
    }
    
    return url
  } catch {
    return url
  }
}

export const isPlaceholderImage = (src: string): boolean => {
  return src.includes('/placeholder.png')
}
