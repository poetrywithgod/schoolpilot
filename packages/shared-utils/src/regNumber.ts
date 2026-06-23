export const generateRegNumber = (
  schoolCode: string,
  year: number,
  sequence: number
): string => {
  const paddedSequence = String(sequence).padStart(4, '0')
  return `${schoolCode.toUpperCase()}/${year}/${paddedSequence}`
}