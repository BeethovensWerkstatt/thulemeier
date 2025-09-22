import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderDraft } from '../core/mei/draft.js'

export class SingleDraftRenderer {
  /**
   * Render single draft mode
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @returns {Promise<SVGElement>} Rendered SVG element
   */
  async render (meiDocument, context, outputPath = null) {
    // Create SVG container
    const svg = await createSVGContainer(context.dimensions, {
      title: `Facsimile engraved by Thulemeier ${version()} on ${new Date().toISOString().slice(0, 10)}`
    })

    const draftId = context.options.id
    if (!draftId) {
      throw new Error('Draft ID must be specified in options for singleDraft mode')
    }

    const draft = context.drafts.find(d => d.draftId === draftId)
    if (draft) {
      renderDraft(draft, svg, context)
    } else {
      throw new Error(`Draft with ID ${draftId} not found`)
    }

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
