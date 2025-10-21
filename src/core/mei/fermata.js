/**
 * Renders a single fermata into the given staff group
 * @param {Object} fermataObj - the fermata object with x, y, id, staff, form properties
 * @param {SVGElement} systemG - the system group element to render the fermata into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderFermata (fermataObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  // Ensure fermata symbols exist in defs
  ensureFermataSymbols(svg, doc)

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (fermataObj.x * scale)
  const y = rastrumY + (fermataObj.y * scale)

  // Create the fermata group
  const fermataG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  fermataG.setAttribute('class', 'fermata' + (fermataObj.unclear ? ' unclear' : ''))
  fermataG.setAttribute('data-id', fermataObj.id)
  fermataG.setAttribute('data-class', 'fermata' + (fermataObj.unclear ? ' unclear' : ''))

  // Create the use element
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')

  // Determine which symbol to use based on 'form' attribute
  if (fermataObj.form === 'inv') {
    use.setAttribute('href', '#fermataInv-symbol')
  } else {
    use.setAttribute('href', '#fermataNorm-symbol')
  }

  use.setAttribute('x', x + 'px')
  use.setAttribute('y', y + 'px')
  use.setAttribute('height', '720px')
  use.setAttribute('width', '720px')

  fermataG.appendChild(use)
  systemG.appendChild(fermataG)
}

/**
 * Ensures the fermata symbols are defined in the SVG defs section
 * @param {SVGElement} svg - the root SVG element
 * @param {Document} doc - the document context
 */
function ensureFermataSymbols (svg, doc) {
  // Check if symbols already exist
  const existingSymbolNorm = svg.querySelector('defs #fermataNorm-symbol')
  const existingSymbolInv = svg.querySelector('defs #fermataInv-symbol')

  if (existingSymbolNorm && existingSymbolInv) {
    return
  }

  // Ensure defs section exists
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)
  }

  // Create normal fermata symbol if it doesn't exist
  if (!existingSymbolNorm) {
    const symbolNorm = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbolNorm.setAttribute('id', 'fermataNorm-symbol')
    symbolNorm.setAttribute('viewBox', '0 0 1000 1000')
    symbolNorm.setAttribute('overflow', 'inherit')

    const pathNorm = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathNorm.setAttribute('transform', 'scale(1,-1)')
    pathNorm.setAttribute('d', 'M0 0c0 0 40 320 300 320s300 -320 300 -320h-32s-38 227 -268 227s-268 -227 -268 -227h-32zM355 52c0 -30 -25 -55 -55 -55s-55 25 -55 55s25 55 55 55s55 -25 55 -55z')

    symbolNorm.appendChild(pathNorm)
    defs.appendChild(symbolNorm)
  }

  // Create inverted fermata symbol if it doesn't exist
  if (!existingSymbolInv) {
    const symbolInv = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbolInv.setAttribute('id', 'fermataInv-symbol')
    symbolInv.setAttribute('viewBox', '0 0 1000 1000')
    symbolInv.setAttribute('overflow', 'inherit')

    const pathInv = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathInv.setAttribute('transform', 'scale(1,-1)')
    pathInv.setAttribute('d', 'M0 0h32s38 -227 268 -227s268 227 268 227h32s-40 -320 -300 -320s-300 320 -300 320zM355 -52c0 -30 -25 -55 -55 -55s-55 25 -55 55s25 55 55 55s55 -25 55 -55z')

    symbolInv.appendChild(pathInv)
    defs.appendChild(symbolInv)
  }
}
