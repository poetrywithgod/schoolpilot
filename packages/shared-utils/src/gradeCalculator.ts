export const calculateGrade = (total: number): string => {
  if (total >= 75) return 'A1'
  if (total >= 70) return 'B2'
  if (total >= 65) return 'B3'
  if (total >= 60) return 'C4'
  if (total >= 55) return 'C5'
  if (total >= 50) return 'C6'
  if (total >= 45) return 'D7'
  if (total >= 40) return 'E8'
  return 'F9'
}

export const calculateTotal = (
  ca1: number = 0,
  ca2: number = 0,
  exam: number = 0
): number => {
  return ca1 + ca2 + exam
}