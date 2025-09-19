// Cross-environment MEI loader: loads MEI from a path/URL or File object, returns a parsed DOM Document
export async function loadMEI (source) {
  let meiContent
  if (typeof window === 'undefined') {
    // Node.js: source is a file path
    const fs = await import('fs/promises')
    meiContent = await fs.readFile(source, 'utf8')
    // Use jsdom for DOM parsing
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM(meiContent, { contentType: 'application/xml' })
    return dom.window.document
  } else {
    // Browser: source is a File object or URL string
    if (source instanceof File) {
      meiContent = await source.text()
      const parser = new window.DOMParser()
      return parser.parseFromString(meiContent, 'application/xml')
    } else if (typeof source === 'string') {
      const res = await fetch(source)
      meiContent = await res.text()
      const parser = new window.DOMParser()
      return parser.parseFromString(meiContent, 'application/xml')
    }
    throw new Error('Unsupported MEI source type')
  }
}
