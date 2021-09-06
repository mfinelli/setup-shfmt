export function extractVersionFromUrl(url: string): string {
  const regex = /^https:\/\/github\.com\/mvdan\/sh\/releases\/tag\/v(.*)$/
  const match = url.match(regex)
  if (match === null) {
    return ''
  } else {
    return match[1]
  }
}
