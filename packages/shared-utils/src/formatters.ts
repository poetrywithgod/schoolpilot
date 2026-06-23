export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const formatTerm = (term: number): string => {
  const terms: Record<number, string> = {
    1: 'First Term',
    2: 'Second Term',
    3: 'Third Term',
  }
  return terms[term] ?? 'Unknown Term'
}