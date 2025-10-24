import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderRastrums } from '../core/mei/rastrums.js'
import { renderDraft } from '../core/mei/draft.js'

export class SingleDraftStandaloneRenderer {
  /**
   * Render single draft standalone mode
   * Renders a single draft with only the rastrums (staff lines) that are actually used by that draft.
   * This creates a standalone visualization optimized for file size by filtering out unused rastrums.
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @param {string} context.options.id - Draft ID (required)
   * @param {string} [outputPath] - Optional file path to save SVG (Node.js only)
   * @returns {Promise<SVGElement>} Rendered SVG element
   * @throws {Error} If draft ID is not specified or draft is not found
   */
  async render (meiDocument, context, outputPath = null) {
    // Create SVG container
    const svg = await createSVGContainer(context.dimensions, {
      title: `Facsimile engraved by Thulemeier ${version()} on ${new Date().toISOString().slice(0, 10)}`
    })

    const draftId = context.options.id
    if (!draftId) {
      throw new Error('Draft ID must be specified in options for singleDraftStandalone mode')
    }

    const draft = context.drafts.find(d => d.draftId === draftId)
    if (!draft) {
      throw new Error(`Draft with ID ${draftId} not found`)
    }

    // Collect all unique rastrum IDs used by this draft
    const usedRastrumIds = new Set()
    draft.draft.systems.forEach(system => {
      system.staves.forEach(staff => {
        if (staff.rastrum) {
          usedRastrumIds.add(staff.rastrum)
        }
      })
    })

    // Filter context rastrums to only those used by this draft
    const filteredRastrums = context.rastrums.filter(r => usedRastrumIds.has(r.id))

    // Create a modified context with filtered rastrums
    const filteredContext = {
      ...context,
      rastrums: filteredRastrums
    }

    // Render only the rastrums used by this draft
    renderRastrums(meiDocument, svg, filteredContext)

    // Render the draft on top
    renderDraft(draft, svg, context)

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
