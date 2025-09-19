export async function extractSVGFromMEI (meiDocument, basePathOrUrl = '') {
  // Try embedded SVG first
  // Cross-environment SVG extraction from MEI
  const graphic = meiDocument.querySelector('surface > graphic[type="shapes"]')
  if (!graphic) throw new Error('No graphic[type="shapes"] found')

  // Embedded SVG
  const embeddedSVG = graphic.querySelector('svg')
  if (embeddedSVG) {
    return { svgElement: embeddedSVG, svgContent: embeddedSVG.outerHTML }
  }

  // Linked SVG via @target
  const target = graphic.getAttribute('target')
  if (!target) throw new Error('No embedded SVG or @target found')

  // Resolve path/URL
  let svgContent
  if (typeof window === 'undefined') {
    // Node.js: treat as file path (relative to basePathOrUrl)
    const path = require('path')
    const fs = await import('fs/promises')
    const svgPath = path.resolve(basePathOrUrl, target.replace(/^file:\/\//, ''))
    svgContent = await fs.readFile(svgPath, 'utf8')
  } else {
    // Browser: treat as URL (relative to basePathOrUrl)
    const url = new URL(target, basePathOrUrl).href
    const res = await fetch(url)
    svgContent = await res.text()
  }

  // Optionally, parse SVG string to DOM element
  // Parse SVG string to DOM element
  let svgElement
  if (typeof window === 'undefined') {
    // Node.js: use jsdom
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM(svgContent, { contentType: 'image/svg+xml' })
    svgElement = dom.window.document.querySelector('svg')
  } else {
    // Browser: use DOMParser
    /* global DOMParser */
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    svgElement = doc.querySelector('svg')
  }

  return { svgElement, svgContent }
}
