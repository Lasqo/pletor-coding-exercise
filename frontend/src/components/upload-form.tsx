import React from 'react'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { MODAL_TRANSITION, SCALE_FADE_ANIMATION } from '../constants/animation'
import { useFileSelect } from '../hooks/use-file-select'
import { useUpload } from '../hooks/use-upload'
import { DropZone } from './drop-zone'

const UploadForm = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const fileSelect = useFileSelect()
  const uploadMutation = useUpload()

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fileSelect.selectedFile) {
      toast.error('Please select an image first')

      return
    }

    uploadMutation.mutate(
      { file: fileSelect.selectedFile },
      {
        onSuccess: () => {
          fileSelect.clearSelection()
          setIsOpen(false)
        }
      }
    )
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)

    if (!open) {
      fileSelect.clearSelection()
      uploadMutation.reset()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-terracotta-500 px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta-600"
        >
          <Plus size={16} aria-hidden />
          Upload
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-cream-900/40 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            {...SCALE_FADE_ANIMATION}
            transition={MODAL_TRANSITION}
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-cream-50 p-6 shadow-xl"
          >
            <Dialog.Title className="mb-1 font-display text-xl text-cream-900">
              Upload Image
            </Dialog.Title>
            <Dialog.Description className="mb-5 text-sm text-cream-600">
              Select an image file to upload to the gallery
            </Dialog.Description>
            <form onSubmit={handleSubmit}>
              <DropZone
                preview={fileSelect.preview}
                fileName={fileSelect.selectedFile?.name}
                isDragging={fileSelect.isDragging}
                fileInputRef={fileSelect.fileInputRef}
                onDrop={fileSelect.handleDrop}
                onDragOver={fileSelect.handleDragOver}
                onDragLeave={fileSelect.handleDragLeave}
                onFileInputChange={fileSelect.handleFileInputChange}
              />
              {fileSelect.preview ? (
                <button
                  type="button"
                  onClick={fileSelect.clearSelection}
                  className="mt-3 text-sm text-terracotta-500 underline hover:text-terracotta-600"
                >
                  Remove selected image
                </button>
              ) : null}
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                aria-busy={uploadMutation.isPending}
                className="mt-5 w-full rounded-lg bg-cream-900 py-3 text-sm font-semibold text-white hover:bg-cream-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-cream-400 hover:text-cream-600"
              >
                <X size={16} aria-hidden />
              </button>
            </Dialog.Close>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { UploadForm }
