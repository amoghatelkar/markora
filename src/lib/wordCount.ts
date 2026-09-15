export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, ' ').trim()
  if (!stripped) return 0
  return stripped.split(/\s+/).filter(Boolean).length
}

export function countCharacters(text: string): number {
  return text.replace(/<[^>]*>/g, '').length
}
