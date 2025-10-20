import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderRastrums } from '../core/mei/rastrums.js'
import { renderDraft } from '../core/mei/draft.js'

export class FullPageRenderer {
  /**
   * Render full page mode
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @returns {Promise<SVGElement>} Rendered SVG element
   */
  async render (meiDocument, context, outputPath = null) {
    // Create SVG container
    const svg = await createSVGContainer(context.dimensions, {
      title: `Facsimile engraved by Thulemeier ${version()} on ${new Date().toISOString().slice(0, 10)}`
    })

    // Render rastrums on current page
    renderRastrums(meiDocument, svg, context)

    const allDrafts = context.drafts
    allDrafts.forEach(draft => {
      renderDraft(draft, svg, context)
    })

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
