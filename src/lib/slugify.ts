import slugifyLib from "slugify"

export function generateSlug(title: string): string {
  const slug = slugifyLib(title, {
    lower: true,
    strict: true,
    locale: 'tr'
  })
  
  // Add short random id for uniqueness
  const randomId = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomId}`
}
