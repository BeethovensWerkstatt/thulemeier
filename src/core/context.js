import { MEIParser } from '../parsers/mei-parser.js'
import { calculateDimensions } from '../utils/dimensions.js'

/**
 * Create rendering context with document analysis and settings
 * @param {Document} meiDocument - MEI document
 * @param {Object} options - Rendering options
 * @returns {Object} Rendering context
 */
export function createRenderingContext (meiDocument, options) {
  const parser = new MEIParser()

  const context = {
    document: meiDocument,
    options,
    // pages: parser.extractPages(meiDocument),
    // surfaces: parser.extractSurfaces(meiDocument),
    // zones: parser.extractZones(meiDocument),
    rastrums: parser.extractRastrums(meiDocument, options),
    drafts: parser.extractDrafts(meiDocument),
    dimensions: calculateDimensions(meiDocument, options)
  }

  return context
}
