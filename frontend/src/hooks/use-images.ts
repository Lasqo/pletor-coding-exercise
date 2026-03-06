import { useQuery } from '@tanstack/react-query'
import { imagesQueryOptions } from '../constants/queries'

const useImages = () => {
  const imagesQuery = useQuery(imagesQueryOptions())

  return imagesQuery
}

export { useImages }
