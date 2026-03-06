import { queryOptions } from '@tanstack/react-query'
import { fetchImages } from '../lib/api'

const imagesQueryOptions = () => {
  return queryOptions({
    queryKey: ['images'],
    queryFn: fetchImages,
    retry: 3,
    staleTime: 60_000
  })
}

export { imagesQueryOptions }
