/**
 * Renders a single octave marking into the given staff group
 * @param {Object} octaveObj - the octave object with x, y, id, staff, dis, extender, width, dis.place properties
 * @param {SVGElement} systemG - the system group element to render the octave into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderOctave (octaveObj, systemG, rastrum, context, svg) {
  console.log('Rendering octave:', octaveObj)
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  // Ensure octave symbols exist in defs
  ensureOctaveSymbols(svg, doc)

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (octaveObj.x * scale)
  const y = rastrumY + (octaveObj.y * scale)

  // Create the octave group
  const octaveG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  octaveG.setAttribute('class', 'octave' + (octaveObj.unclear ? ' unclear' : ''))
  octaveG.setAttribute('data-id', octaveObj.id)
  octaveG.setAttribute('data-class', 'octave' + (octaveObj.unclear ? ' unclear' : ''))

  if (octaveObj.content) {
    // Create text element for custom content
    const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', x + 'px')
    text.setAttribute('y', y + 'px')
    text.setAttribute('font-size', '720px')
    text.setAttribute('text-anchor', 'start')
    text.textContent = octaveObj.content
    console.log('Using custom content for octave:', octaveObj.content)
  } else {
    // Create the use element for the octave symbol
    const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')

    // Determine which symbol to use based on 'dis' attribute
    if (octaveObj.dis === '15') {
      use.setAttribute('href', '#octave15-symbol')
    } else {
      use.setAttribute('href', '#octave8-symbol')
    }

    use.setAttribute('x', x + 'px')
    use.setAttribute('y', y + 'px')
    use.setAttribute('height', '720px')
    use.setAttribute('width', '720px')

    octaveG.appendChild(use)
  }

  // Add extender line if specified and not explicitly disabled
  if (!octaveObj.extender || octaveObj.extender !== 'false') {
    const width = (octaveObj.width || 0) * scale

    if (octaveObj.disPlace === 'above') {
      // Extender above the staff (bracket goes down toward staff)
      addExtenderLine(doc, octaveG, x, y, width, -230, 180)
    } else {
      // Extender below the staff (bracket goes up toward staff)
      addExtenderLine(doc, octaveG, x, y, width, -9, -180)
    }
  }

  systemG.appendChild(octaveG)
}

/**
 * Adds an extender line with ending bracket to an octave group
 * @param {Document} doc - the document context
 * @param {SVGElement} octaveG - the octave group element
 * @param {number} x - the x position of the octave symbol
 * @param {number} y - the y position of the octave symbol
 * @param {number} width - the width of the extender line
 * @param {number} yOffset - the vertical offset for the line
 * @param {number} bracketOffset - the vertical offset for the bracket
 */
function addExtenderLine (doc, octaveG, x, y, width, yOffset, bracketOffset) {
  const lineX1 = x + 210 // offset from symbol start (taken from original)
  const lineY1 = y + yOffset
  const lineX2 = lineX1 + width

  // Create dashed line
  const extenderPath = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
  extenderPath.setAttribute('d', `M${lineX1} ${lineY1} L${lineX2} ${lineY1}`)
  extenderPath.setAttribute('stroke-width', '18')
  extenderPath.setAttribute('stroke-linecap', 'square')
  extenderPath.setAttribute('stroke-dasharray', '36 72')
  octaveG.appendChild(extenderPath)

  // Create ending bracket (polyline)
  const polyX1 = lineX2
  const polyY1 = lineY1 + bracketOffset
  const polyX2 = lineX2
  const polyY2 = lineY1
  const polyX3 = lineX2 - 90
  const polyY3 = lineY1

  const points = `${polyX1},${polyY1} ${polyX2},${polyY2} ${polyX3},${polyY3}`

  const polyline = doc.createElementNS('http://www.w3.org/2000/svg', 'polyline')
  polyline.setAttribute('stroke', 'currentColor')
  polyline.setAttribute('stroke-width', '18')
  polyline.setAttribute('stroke-opacity', '1')
  polyline.setAttribute('fill', 'none')
  polyline.setAttribute('points', points)
  octaveG.appendChild(polyline)
}

/**
 * Ensures the octave symbols are defined in the SVG defs section
 * @param {SVGElement} svg - the root SVG element
 * @param {Document} doc - the document context
 */
function ensureOctaveSymbols (svg, doc) {
  // Check if symbols already exist
  const existingSymbol8 = svg.querySelector('defs #octave8-symbol')
  const existingSymbol15 = svg.querySelector('defs #octave15-symbol')

  if (existingSymbol8 && existingSymbol15) {
    return
  }

  // Ensure defs section exists
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)
  }

  // Create octave8 symbol if it doesn't exist
  if (!existingSymbol8) {
    const symbol8 = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol8.setAttribute('id', 'octave8-symbol')
    symbol8.setAttribute('viewBox', '0 0 1000 1000')
    symbol8.setAttribute('overflow', 'inherit')

    const path8 = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path8.setAttribute('transform', 'scale(1,-1)')
    path8.setAttribute('d', 'M86 180c-15 17 -25 40 -28 67c0 11 3 22 8 33s13 21 23 29c21 15 47 23 78 23c29 0 53 -9 71 -27s27 -37 28 -58c0 -17 -6 -32 -17 -45s-28 -25 -51 -36c21 -25 32 -52 32 -80c0 -23 -10 -44 -30 -61c-21 -16 -51 -24 -90 -24c-34 0 -61 8 -80 25s-29 37 -30 60 c0 18 7 36 22 55c13 16 34 29 64 39zM98 168c-19 -12 -34 -25 -43 -38s-14 -28 -15 -44c2 -23 9 -38 21 -47s30 -15 55 -18c17 0 29 4 38 12s13 21 14 38c-3 21 -26 54 -70 97zM187 180c26 20 39 44 39 71c0 17 -5 31 -16 44s-25 19 -42 20c-28 0 -44 -15 -47 -44l2 -12 c7 -22 29 -48 64 -79z')

    symbol8.appendChild(path8)
    defs.appendChild(symbol8)
  }

  // Create octave15 symbol if it doesn't exist
  if (!existingSymbol15) {
    const symbol15 = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol15.setAttribute('id', 'octave15-symbol')
    symbol15.setAttribute('viewBox', '0 0 1000 1000')
    symbol15.setAttribute('overflow', 'inherit')

    const path15 = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path15.setAttribute('transform', 'scale(1,-1)')
    // This would need the actual path data for octave15 - using octave8 path as placeholder
    path15.setAttribute('d', 'M86 180c-15 17 -25 40 -28 67c0 11 3 22 8 33s13 21 23 29c21 15 47 23 78 23c29 0 53 -9 71 -27s27 -37 28 -58c0 -17 -6 -32 -17 -45s-28 -25 -51 -36c21 -25 32 -52 32 -80c0 -23 -10 -44 -30 -61c-21 -16 -51 -24 -90 -24c-34 0 -61 8 -80 25s-29 37 -30 60 c0 18 7 36 22 55c13 16 34 29 64 39zM98 168c-19 -12 -34 -25 -43 -38s-14 -28 -15 -44c2 -23 9 -38 21 -47s30 -15 55 -18c17 0 29 4 38 12s13 21 14 38c-3 21 -26 54 -70 97zM187 180c26 20 39 44 39 71c0 17 -5 31 -16 44s-25 19 -42 20c-28 0 -44 -15 -47 -44l2 -12 c7 -22 29 -48 64 -79z')

    symbol15.appendChild(path15)
    defs.appendChild(symbol15)
  }
}
