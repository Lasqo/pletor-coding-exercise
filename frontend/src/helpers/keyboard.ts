type ActivationKey = 'Enter' | ' '

const ACTIVATION_KEYS: ActivationKey[] = ['Enter', ' ']

const matchIsActivationKey = (key: string): key is ActivationKey => {
  return ACTIVATION_KEYS.includes(key as ActivationKey)
}

export { matchIsActivationKey }
