/**
 * Thulemeier - A facsimile renderer for MEI data operating on level 5 visual data
 * @version 1.0.0
 * @author Johannes Kepper
 * @license AGPL-3.0
 */

import { Renderer } from './src/core/renderer.js'
import { getSupportedModes } from './src/modes/index.js'

// Version is hardcoded to avoid Node.js dependencies in browser
const VERSION = '1.0.0'

/**
 * Main rendering function for MEI documents
 * @param {Document|string} input - MEI document as DOM or XML string
 * @param {Object} options - Rendering options
 * @param {string} options.mode - Rendering mode ('fullPage')
 * @returns {Promise<SVGElement>} Rendered SVG element
 */
export async function render (input, options = {}) {
  const renderer = new Renderer()
  const svg = await renderer.render(input, options)
  if (options.outputPath && typeof window === 'undefined') {
    const fs = await import('fs/promises')
    await fs.writeFile(options.outputPath, svg.outerHTML, 'utf8')
  }
  return svg
}

/**
 * Get version information
 * @returns {string} Version string
 */
export function version () {
  return VERSION
}

/**
 * Get supported rendering modes
 * @returns {Array<string>} Array of supported modes
 */
export function supportedModes () {
  return getSupportedModes()
}

// Export classes
export { Renderer }
