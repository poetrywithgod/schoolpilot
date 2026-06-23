export const generateDefaultPin = (regNumber: string): string => {
  return regNumber.slice(-4)
}

export const generateLinkingCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}