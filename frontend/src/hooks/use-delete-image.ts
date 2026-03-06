import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { imagesQueryOptions } from '../constants/queries'
import { deleteImage } from '../lib/api'

const useDeleteImage = () => {
  const queryClient = useQueryClient()

  const deleteImageMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      void queryClient.invalidateQueries(imagesQueryOptions())
      toast.success('Image deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return deleteImageMutation
}

export { useDeleteImage }
