export const isValidScore = (
  score: number,
  max: number
): boolean => {
  return score >= 0 && score <= max
}

export const isValidPin = (pin: string): boolean => {
  return /^\d{4,6}$/.test(pin)
}

export const isValidRegNumber = (regNumber: string): boolean => {
  return /^[A-Z]+\/\d{4}\/\d{4}$/.test(regNumber)
}

export const isValidPhone = (phone: string): boolean => {
  return /^(\+234|0)[789]\d{9}$/.test(phone)
}