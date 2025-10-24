import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderRastrums } from '../core/mei/rastrums.js'

export class EmptyPageRenderer {
  /**
   * Render empty page mode
   * Renders only the rastrums (empty staff lines) without any musical content
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @param {string} [outputPath] - Optional file path to save SVG (Node.js only)
   * @returns {Promise<SVGElement>} Rendered SVG element
   */
  async render (meiDocument, context, outputPath = null) {
    // Create SVG container
    const svg = await createSVGContainer(context.dimensions, {
      title: `Facsimile engraved by Thulemeier ${version()} on ${new Date().toISOString().slice(0, 10)}`
    })

    // Render rastrums on current page
    renderRastrums(meiDocument, svg, context)

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
