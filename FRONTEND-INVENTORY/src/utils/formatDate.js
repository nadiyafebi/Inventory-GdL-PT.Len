export function formatDate(dateString, locale = 'id-ID') {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date)) return 'Invalid Date'
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString, locale = 'id-ID') {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date)) return 'Invalid Date'
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
