// Default dimensions for articulation symbols (following standard pattern)
const defaultArticDimensions = { width: '720px', height: '720px' }

// Actual symbol path data for different articulation types
const articSymbolPaths = {
  stroke: 'M0 0v240h33v-240h-33z',
  acc: 'M0 236l347 -119l-347 -117v33l252 84l-252 86v33z',
  marc: 'M273 0h-82l-84 154l-78 -154h-29l137 265z',
  ten: 'M8 36h330c8 0 8 -4 8 -12v-12c0 -8 0 -12 -8 -12h-330c-8 0 -8 4 -8 12v12c0 8 0 12 8 12z',
  dot: 'M0 48c0 26 22 48 48 48s48 -22 48 -48s-22 -48 -48 -48s-48 22 -48 48z', // similar as 'stacc'
  stacciss: 'M153 224l-77 -224l-76 224h36c9 -3 15 -9 20 -18c9 -16 16 -25 20 -26c6 2 11 7 14 14c7 16 16 26 26 30h37z',
  stress: 'M83.8125 176.2031 L52.7344 215.7188 L31.9219 215.7188 L50.625 176.2031 L83.8125 176.2031 Z',
  unstress: 'M89.5781 177.8906 Q88.875 193.5 77.4844 203.9844 Q66.0938 214.4531 47.8125 214.4531 Q29.6719 214.4531 18.3438 203.9844 Q7.0312 193.5 6.3281 177.8906 L23.625 177.8906 Q25.4531 187.4531 31.5 192.2344 Q37.5469 197.0156 47.8125 197.0156 Q58.0781 197.0156 64.1875 192.2344 Q70.3125 187.4531 72.2812 177.8906 L89.5781 177.8906 Z'
}

/**
 * Renders a single articulation into the given staff group
 * @param {Object} articObj - the artic object with x, y, id, staff, artic properties
 * @param {SVGElement} systemG - the system group element to render the artic into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderArtic (articObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  console.log(311, 'Rendering articulation:', articObj, rastrum)

  // Determine which symbol to use based on 'artic' attribute
  const articType = articObj.artic || 'dot'

  // Handle stacc as alias for dot
  const symbolType = articType === 'stacc' ? 'dot' : articType

  // Ensure the specific articulation symbol exists in defs
  ensureArticSymbol(svg, doc, symbolType)

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (articObj.x * scale)
  const y = rastrumY + (articObj.y * scale)

  // Create the articulation group
  const articG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  articG.setAttribute('class', 'artic ' + articType)
  articG.setAttribute('data-id', articObj.id)
  articG.setAttribute('data-class', 'artic')

  // Create the use element
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')

  use.setAttribute('href', `#artic${symbolType.charAt(0).toUpperCase() + symbolType.slice(1)}-symbol`)

  use.setAttribute('x', x + 'px')
  use.setAttribute('y', y + 'px')

  // Set dimensions (using standard dimensions for all articulations)
  use.setAttribute('height', defaultArticDimensions.height)
  use.setAttribute('width', defaultArticDimensions.width)

  articG.appendChild(use)
  systemG.appendChild(articG)
}

/**
 * Ensures a specific articulation symbol is defined in the SVG defs section
 * @param {SVGElement} svg - the root SVG element
 * @param {Document} doc - the document context
 * @param {string} articType - the type of articulation symbol needed
 */
function ensureArticSymbol (svg, doc, articType) {
  const symbolId = `artic${articType.charAt(0).toUpperCase() + articType.slice(1)}-symbol`
  const existingSymbol = svg.querySelector(`defs #${symbolId}`)

  if (!existingSymbol) {
    // Ensure defs section exists
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.appendChild(defs)
    }

    const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', symbolId)
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')

    // Get the path data for the specific articulation type
    const pathData = articSymbolPaths[articType] || articSymbolPaths.dot
    path.setAttribute('d', pathData)

    symbol.appendChild(path)
    defs.appendChild(symbol)
  }
}
