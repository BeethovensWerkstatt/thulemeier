import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderRastrums } from '../core/mei/rastrums.js'
import { renderDraft } from '../core/mei/draft.js'

export class SingleSystemRenderer {
  /**
   * Render single system mode
   * Renders a specific system from a specific draft, with only the rastrums used by that system.
   * This creates a standalone visualization of one system optimized for file size.
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @param {string} context.options.id - Draft ID (required)
   * @param {string} context.options.systemId - System ID (required)
   * @param {string} [outputPath] - Optional file path to save SVG (Node.js only)
   * @returns {Promise<SVGElement>} Rendered SVG element
   * @throws {Error} If draft ID or system ID is not specified, or if not found
   */
  async render (meiDocument, context, outputPath = null) {
    // Create SVG container
    const svg = await createSVGContainer(context.dimensions, {
      title: `Facsimile engraved by Thulemeier ${version()} on ${new Date().toISOString().slice(0, 10)}`
    })

    const draftId = context.options.id
    if (!draftId) {
      throw new Error('Draft ID must be specified in options for singleSystem mode')
    }

    const systemId = context.options.systemId
    if (!systemId) {
      throw new Error('System ID must be specified in options for singleSystem mode')
    }

    const draft = context.drafts.find(d => d.draftId === draftId)
    if (!draft) {
      throw new Error(`Draft with ID ${draftId} not found`)
    }

    // Find the specific system
    const system = draft.draft.systems.find(s => s.id === systemId)
    if (!system) {
      throw new Error(`System with ID ${systemId} not found in draft ${draftId}`)
    }

    // Collect all unique rastrum IDs used by this specific system
    const usedRastrumIds = new Set()
    system.staves.forEach(staff => {
      if (staff.rastrum) {
        usedRastrumIds.add(staff.rastrum)
      }
    })

    // Filter context rastrums to only those used by this system
    const filteredRastrums = context.rastrums.filter(r => usedRastrumIds.has(r.id))

    // Create a modified context with filtered rastrums
    const filteredContext = {
      ...context,
      rastrums: filteredRastrums
    }

    // Render only the rastrums used by this system
    renderRastrums(meiDocument, svg, filteredContext)

    // Create a modified draft object with only this system
    const singleSystemDraft = {
      ...draft,
      draft: {
        ...draft.draft,
        systems: [system]
      }
    }

    // Render the single system
    renderDraft(singleSystemDraft, svg, context)

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
