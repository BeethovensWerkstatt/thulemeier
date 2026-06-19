import { MEIParser } from '../parsers/mei-parser.js'
import { createRenderingContext } from './context.js'
import { validateInput, validateMeiDocument } from './validators.js'
import { getRenderer } from '../modes/index.js'

export class Renderer {
  constructor (options = {}) {
    this.defaultOptions = {
      mode: 'fullPage',
      baseScaling: 90, // same as Verovio defaults, matching a `unit` param with a default value of 9, and a general scaling factor of 10 in Verovio.
      ...options
    }
  }

  /**
   * Main rendering method
   * @param {Document|string} input - MEI document as DOM or XML string
   * @param {Object} options - Rendering options
   * @returns {Promise<SVGElement>} Rendered SVG element
   */
  async render (input, options = {}) {
    // Merge options with defaults
    const renderOptions = { ...this.defaultOptions, ...options }

    // Validate input
    validateInput(input, renderOptions)

    // Parse MEI document
    const parser = new MEIParser()
    const meiDocument = await parser.parse(input)

    // Validate MEI structure
    validateMeiDocument(meiDocument)

    // Create rendering context
    const context = createRenderingContext(meiDocument, renderOptions)

    // Get appropriate mode renderer
    const modeRenderer = getRenderer(renderOptions.mode)
    if (!modeRenderer) {
      throw new Error(`Unsupported rendering mode: ${renderOptions.mode}`)
    }

    // Render using mode-specific renderer
    return modeRenderer.render(meiDocument, context)
  }
}
