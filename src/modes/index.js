import { FullPageRenderer } from './full-page.js'
import { EmptyPageRenderer } from './empty-page.js'
import { SingleDraftRenderer } from './single-draft.js'

const renderers = {
  fullPage: new FullPageRenderer(),
  emptyPage: new EmptyPageRenderer(),
  singleDraft: new SingleDraftRenderer()
}

/**
 * Get renderer for specified mode
 * @param {string} mode - Rendering mode
 * @returns {Object} Mode renderer
 */
export function getRenderer (mode) {
  return renderers[mode]
}

/**
 * Get supported rendering modes
 * @returns {Array<string>} Array of supported modes
 */
export function getSupportedModes () {
  return Object.keys(renderers)
}
