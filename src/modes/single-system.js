import { createSVGContainer } from '../utils/svg-factory.js'
import { version } from '../../index.js'
import { renderRastrums } from '../core/mei/rastrums.js'
import { renderDraft } from '../core/mei/draft.js'

export class SingleSystemRenderer {
  /**
   * Calculate bounding box of SVG content
   * @param {SVGElement} svg - SVG element
   * @returns {Object} Bounding box {x, y, width, height}
   */
  calculateBoundingBox (svg) {
    // Get all rendered elements (skip defs, metadata)
    const contentElements = svg.querySelectorAll('g[id^="draft"], g[class*="rastrum"]')
    
    if (contentElements.length === 0) {
      // Fallback to full viewBox if no content found
      const viewBox = svg.getAttribute('viewBox').split(' ').map(parseFloat)
      return {
        x: viewBox[0],
        y: viewBox[1],
        width: viewBox[2],
        height: viewBox[3]
      }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    // Iterate through all content elements to find bounds
    contentElements.forEach(element => {
      // Get all path, line, rect, circle elements
      const shapes = element.querySelectorAll('path, line, rect, circle, text, use')
      
      shapes.forEach(shape => {
        const tagName = shape.tagName.toLowerCase()
        
        if (tagName === 'path') {
          const d = shape.getAttribute('d')
          if (d) {
            // Parse path data to extract coordinates
            const coords = d.match(/-?\d+\.?\d*/g)
            if (coords) {
              for (let i = 0; i < coords.length; i += 2) {
                const x = parseFloat(coords[i])
                const y = parseFloat(coords[i + 1])
                if (!isNaN(x)) minX = Math.min(minX, x)
                if (!isNaN(x)) maxX = Math.max(maxX, x)
                if (!isNaN(y)) minY = Math.min(minY, y)
                if (!isNaN(y)) maxY = Math.max(maxY, y)
              }
            }
          }
        } else if (tagName === 'line') {
          const x1 = parseFloat(shape.getAttribute('x1'))
          const y1 = parseFloat(shape.getAttribute('y1'))
          const x2 = parseFloat(shape.getAttribute('x2'))
          const y2 = parseFloat(shape.getAttribute('y2'))
          minX = Math.min(minX, x1, x2)
          maxX = Math.max(maxX, x1, x2)
          minY = Math.min(minY, y1, y2)
          maxY = Math.max(maxY, y1, y2)
        } else if (tagName === 'rect') {
          const x = parseFloat(shape.getAttribute('x'))
          const y = parseFloat(shape.getAttribute('y'))
          const width = parseFloat(shape.getAttribute('width'))
          const height = parseFloat(shape.getAttribute('height'))
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x + width)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y + height)
        } else if (tagName === 'circle') {
          const cx = parseFloat(shape.getAttribute('cx'))
          const cy = parseFloat(shape.getAttribute('cy'))
          const r = parseFloat(shape.getAttribute('r'))
          minX = Math.min(minX, cx - r)
          maxX = Math.max(maxX, cx + r)
          minY = Math.min(minY, cy - r)
          maxY = Math.max(maxY, cy + r)
        }
      })
    })

    // If no valid bounds found, fallback to viewBox
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      const viewBox = svg.getAttribute('viewBox').split(' ').map(parseFloat)
      return {
        x: viewBox[0],
        y: viewBox[1],
        width: viewBox[2],
        height: viewBox[3]
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Render single system mode
   * Renders a specific system from a specific draft, with only the rastrums used by that system.
   * This creates a standalone visualization of one system optimized for file size.
   * @param {Document} meiDocument - MEI document
   * @param {Object} context - Rendering context
   * @param {string} context.options.id - Draft ID (required)
   * @param {string} context.options.systemId - System ID (required)
   * @param {number} [context.options.systemMargin=90] - Margin around system in SVG units (default 1cm at 90dpi)
   * @param {number} [context.options.systemScaleFactor=0.1] - Scale factor for width/height attributes (default 0.1)
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

    // Calculate bounding box and adjust viewBox with margin
    const margin = context.options.systemMargin !== undefined ? context.options.systemMargin : 90 // Default 1cm at 90dpi
    const bbox = this.calculateBoundingBox(svg)
    
    // Create new viewBox with margin
    const newViewBox = `${bbox.x - margin} ${bbox.y - margin} ${bbox.width + (2 * margin)} ${bbox.height + (2 * margin)}`
    svg.setAttribute('viewBox', newViewBox)
    
    // Remove width and height attributes - let the browser decide based on viewBox and container
    svg.removeAttribute('width')
    svg.removeAttribute('height')

    // If outputPath is provided and running in Node.js, save SVG to file
    if (outputPath && typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(outputPath, svg.outerHTML, 'utf8')
    }

    return svg
  }
}
