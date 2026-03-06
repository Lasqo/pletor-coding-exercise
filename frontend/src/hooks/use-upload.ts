import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { imagesQueryOptions } from '../constants/queries'
import { uploadImage } from '../lib/api'

const useUpload = () => {
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: () => {
      void queryClient.invalidateQueries(imagesQueryOptions())
      toast.success('Image uploaded successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return uploadMutation
}

export { useUpload }
