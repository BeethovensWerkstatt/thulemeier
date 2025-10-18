/**
 * Renders a single trill into the given staff group
 * @param {Object} trillObj - the trill object with x, y, id, staff properties
 * @param {SVGElement} systemG - the system group element to render the trill into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderTrill (trillObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  // Ensure trill symbol exists in defs
  ensureTrillSymbol(svg, doc)

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (trillObj.x * scale)
  const y = rastrumY + (trillObj.y * scale)

  // Create the trill group
  const trillG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  trillG.setAttribute('class', 'trill')
  trillG.setAttribute('data-id', trillObj.id)
  trillG.setAttribute('data-class', 'trill')

  // Create the use element
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('href', '#trill-symbol')
  use.setAttribute('x', x + 'px')
  use.setAttribute('y', y + 'px')
  use.setAttribute('height', '720px')
  use.setAttribute('width', '720px')

  trillG.appendChild(use)
  systemG.appendChild(trillG)
}

/**
 * Ensures the trill symbol is defined in the SVG defs section
 * @param {SVGElement} svg - the root SVG element
 * @param {Document} doc - the document context
 */
function ensureTrillSymbol (svg, doc) {
  // Check if symbol already exists
  const existingSymbol = svg.querySelector('defs #trill-symbol')
  if (existingSymbol) {
    return
  }

  // Ensure defs section exists
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)
  }

  // Create the trill symbol
  const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
  symbol.setAttribute('id', 'trill-symbol')
  symbol.setAttribute('viewBox', '0 0 1000 1000')
  symbol.setAttribute('overflow', 'inherit')

  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('transform', 'scale(1,-1)')
  path.setAttribute('d', 'M162 167l-36 -115l-1 -10c0 -10 5 -16 16 -19c32 18 48 43 48 75c0 20 -9 43 -27 69zM432 225c0 -21 -11 -36 -31 -37c-15 0 -20 10 -23 25l3 14l2 11l1 9l-4 4c-1 -1 -2 -1 -3 -1c-23 -13 -36 -24 -47 -48l-12 -27c-18 -50 -31 -105 -47 -157h-60l58 214c0 7 -3 5 -5 9 c-7 0 -25 -8 -51 -28l-37 -28c20 -34 31 -67 31 -97c0 -12 -1 -21 -4 -28l-6 -15c-1 -3 -5 -10 -12 -19c-14 -18 -30 -26 -49 -26c-30 0 -67 18 -67 52c1 1 1 6 3 15l20 84c-9 -5 -21 -8 -36 -8c-21 0 -29 7 -40 19c-10 12 -16 27 -16 47c0 23 6 33 17 45s25 18 46 18 c19 0 39 -8 60 -25l34 117h63l-46 -158l38 31l32 20c21 10 35 13 62 15c16 0 24 -7 24 -21l-1 -10l-6 -24c21 37 44 55 70 55c23 0 39 -23 39 -47zM18 208c0 -27 17 -47 45 -47l3 -2l13 4l23 9l14 55c-17 15 -35 22 -55 22c-26 0 -43 -17 -43 -41z')

  symbol.appendChild(path)
  defs.appendChild(symbol)
}
