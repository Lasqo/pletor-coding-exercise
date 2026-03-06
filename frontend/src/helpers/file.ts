import { ACCEPTED_IMAGE_EXTENSIONS } from '../constants/image'

const matchIsImageFile = (file: File) => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`

  return ACCEPTED_IMAGE_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_IMAGE_EXTENSIONS)[number]
  )
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      resolve(String(reader.result))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

export { matchIsImageFile, readFileAsDataUrl }
