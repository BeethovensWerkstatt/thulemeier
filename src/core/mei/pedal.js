/**
 * Renders a single pedal marking into the given staff group
 * @param {Object} pedalObj - the pedal object with x, y, id, staff, dir properties
 * @param {SVGElement} systemG - the system group element to render the pedal into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderPedal (pedalObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  // Ensure pedal symbols exist in defs
  ensurePedalSymbols(svg, doc)

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (pedalObj.x * scale)
  // Special y calculation with font size offset (405 / factor in original)
  const y = rastrumY + ((pedalObj.y + (405 / 90)) * scale)

  // Create the pedal group
  const pedalG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  pedalG.setAttribute('class', 'pedal' + (pedalObj.unclear ? ' unclear' : ''))
  pedalG.setAttribute('data-id', pedalObj.id)
  pedalG.setAttribute('data-class', 'pedal' + (pedalObj.unclear ? ' unclear' : ''))

  // Create the use element
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')

  // Determine which symbol to use based on 'dir' attribute
  if (pedalObj.dir === 'up') {
    use.setAttribute('href', '#pedalUp-symbol')
  } else {
    use.setAttribute('href', '#pedalDown-symbol')
  }

  use.setAttribute('x', x + 'px')
  use.setAttribute('y', y + 'px')
  use.setAttribute('height', '720px')
  use.setAttribute('width', '720px')

  pedalG.appendChild(use)
  systemG.appendChild(pedalG)
}

/**
 * Ensures the pedal symbols are defined in the SVG defs section
 * @param {SVGElement} svg - the root SVG element
 * @param {Document} doc - the document context
 */
function ensurePedalSymbols (svg, doc) {
  // Check if symbols already exist
  const existingSymbolDown = svg.querySelector('defs #pedalDown-symbol')
  const existingSymbolUp = svg.querySelector('defs #pedalUp-symbol')

  if (existingSymbolDown && existingSymbolUp) {
    return
  }

  // Ensure defs section exists
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)
  }

  // Create pedal down symbol if it doesn't exist
  if (!existingSymbolDown) {
    const symbolDown = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbolDown.setAttribute('id', 'pedalDown-symbol')
    symbolDown.setAttribute('viewBox', '0 0 1000 1000')
    symbolDown.setAttribute('overflow', 'inherit')

    const pathDown = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathDown.setAttribute('transform', 'scale(1,-1)')
    pathDown.setAttribute('d', 'M657 134c0 -35 -12 -66 -37 -93s-54 -41 -87 -41h-14c-6 8 -11 14 -14 17c-11 12 -21 18 -29 18c-15 0 -27 -3 -38 -10c-13 -11 -24 -19 -32 -25h-66l-40 47l-33 -47h-77c-5 19 -10 33 -13 42c-6 15 -13 22 -24 22h-3c-17 -2 -33 -12 -49 -30c-9 -11 -19 -23 -29 -34h-34 c0 29 34 67 103 113c33 22 49 46 49 72c0 17 -11 41 -32 71s-32 65 -33 106c0 15 1 30 3 47s6 37 11 61c-1 4 -4 7 -7 9s-9 3 -18 3c-19 -5 -33 -11 -42 -18c-28 -21 -42 -54 -42 -97c0 -11 2 -20 5 -27s8 -12 13 -15c2 -1 4 -1 6 -1c14 0 26 14 36 42c3 3 6 5 9 8 c1 -2 1 -6 1 -11c0 -15 -4 -28 -12 -40c-11 -16 -28 -26 -50 -31c-9 0 -17 5 -24 15c-9 13 -14 32 -14 55c0 45 15 82 45 110s68 42 113 42c52 0 92 -10 119 -30s41 -48 42 -83c0 -14 -2 -28 -7 -42c-12 -21 -27 -31 -44 -31c-18 0 -36 9 -53 28s-26 34 -26 47c0 6 2 9 7 10 c4 -11 8 -20 12 -25c12 -17 27 -26 46 -26c15 0 25 4 30 12s8 19 8 32c0 21 -8 36 -23 47s-35 19 -60 24c-10 2 -17 3 -20 3c-4 0 -13 -1 -26 -3c-5 -15 -9 -31 -11 -46s-3 -34 -3 -57c0 -21 7 -43 21 -68l54 -90c3 -13 4 -25 4 -37c0 -22 -8 -42 -25 -61 c-9 -9 -13 -17 -13 -22c9 -9 15 -20 18 -33s15 -23 36 -28c17 5 29 10 36 15s10 12 10 21c0 7 -4 19 -12 38c-5 13 -9 23 -11 30c-1 6 -1 11 -1 14c0 28 8 53 24 76s38 34 67 34c21 0 36 -4 44 -12s14 -23 17 -46c0 -3 1 -6 1 -9c0 -18 -8 -35 -22 -49 c-23 -21 -45 -41 -68 -61c6 -11 13 -21 21 -31c17 -21 33 -31 50 -31c12 0 25 5 39 15c4 3 10 8 17 15c-1 12 -2 22 -2 31c0 37 7 68 20 95c19 38 51 67 97 87c-21 47 -53 88 -96 124c-41 29 -82 57 -123 86c29 -3 66 -17 111 -44c55 -32 98 -70 131 -115 c42 -57 63 -118 63 -184zM379 227c-10 0 -20 -1 -31 -2s-18 -6 -22 -15s-7 -17 -8 -25s-2 -17 -2 -26v-20c28 0 46 9 55 28c5 11 8 31 8 60zM513 54c6 -13 16 -19 30 -19c16 0 30 8 43 24s19 39 20 70c0 25 -3 52 -10 80s-15 42 -25 43c-21 -9 -38 -26 -50 -52 s-18 -55 -18 -87c0 -23 3 -43 10 -59zM671 50c7 0 12 -3 17 -8s7 -11 7 -18s-3 -12 -8 -17s-12 -7 -19 -7s-12 3 -17 8s-7 12 -7 19c0 15 9 23 27 23z')

    symbolDown.appendChild(pathDown)
    defs.appendChild(symbolDown)
  }

  // Create pedal up symbol if it doesn't exist
  if (!existingSymbolUp) {
    const symbolUp = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbolUp.setAttribute('id', 'pedalUp-symbol')
    symbolUp.setAttribute('viewBox', '0 0 1000 1000')
    symbolUp.setAttribute('overflow', 'inherit')

    const pathUp = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathUp.setAttribute('transform', 'scale(1,-1)')
    pathUp.setAttribute('d', 'M217 244c-22 0 -39 -16 -39 -37c0 -18 21 -34 39 -35c20 0 35 18 35 37c0 21 -15 34 -35 35zM44 317c3 26 25 51 52 51c16 0 28 -4 32 -12c11 -14 14 -56 22 -76c6 -8 14 -12 25 -14l16 5c9 5 14 11 15 25c0 7 -2 13 -5 17l-11 18l-17 17l-9 22c0 28 25 47 53 47 s50 -23 50 -47c0 -20 -7 -25 -21 -39l-15 -20c-4 -7 -6 -13 -7 -18c1 -4 5 -11 5 -14l11 -11l14 -7c20 2 30 22 33 47c0 39 17 58 49 58c26 0 46 -21 46 -47c0 -29 -23 -46 -54 -46c-30 0 -45 -11 -48 -34l5 -12c1 -3 4 -5 7 -8c1 -2 6 -3 14 -5c10 2 17 6 23 12 c8 3 6 4 16 12l21 15c4 3 12 5 21 5c23 0 43 -26 44 -49c0 -20 -16 -41 -30 -49c-3 -1 -10 -3 -19 -4c-7 1 -16 7 -30 18l-26 19c-4 3 -11 4 -20 4c-8 0 -14 -1 -17 -4l-9 -19c2 -13 6 -21 14 -24l11 -4l27 -5c16 0 28 -4 37 -12c9 -6 13 -17 13 -34c0 -13 -5 -25 -14 -34 c-9 -8 -22 -13 -36 -16c-11 2 -23 8 -34 19c-8 11 -11 27 -11 47c0 11 -4 21 -7 27c-5 8 -14 12 -26 12c-19 0 -29 -15 -32 -31c3 -7 8 -14 11 -21c4 -8 8 -14 13 -21l8 -8l5 -10c3 -5 4 -13 5 -21c0 -26 -26 -39 -52 -39c-25 0 -45 15 -48 39c1 6 5 18 7 21 c11 14 22 29 33 43c2 4 3 10 4 19c0 17 -8 26 -24 29c-31 0 -40 -20 -40 -51s-17 -49 -48 -54c-33 7 -42 20 -50 52c3 31 25 46 66 46c19 0 37 12 37 31c0 8 -3 13 -8 16c-3 4 -8 7 -16 7c-10 0 -24 -6 -40 -18c-14 -9 -25 -16 -39 -21c-28 3 -45 20 -46 51 c0 26 18 47 44 47c19 0 31 -9 44 -19l18 -14l19 -7c18 4 26 12 26 23c0 23 -15 34 -46 34c-37 0 -57 14 -61 44z')

    symbolUp.appendChild(pathUp)
    defs.appendChild(symbolUp)
  }
}
