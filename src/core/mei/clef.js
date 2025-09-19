const clefWidth = 561
const clefHeight = 561

/**
 * Renders a single clef into the given staff group
 * @param {Object} clefObj - the clef object with shape, line, x
 * @param {SVGElement} staffG - the staff group element to render the clef into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderClef (clefObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  console.log('Rendering clef:', clefObj)
  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const clefShape = clefObj.shape // 'G', 'C', 'F'
  const symbolId = 'sym_clef_' + clefShape

  const defs = svg.querySelector('defs')
  const symbolAvailable = defs.querySelector('#' + symbolId)

  if (!symbolAvailable) {
    // You can add your own path d values for each clef shape
    const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', symbolId)
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')
    let d = ''
    switch (clefShape) {
      case 'G':
        d = 'M343 -190c-18 -3 -37 -5 -59 -5c-46 0 -79 6 -101 16c-68 33 -117 72 -146 119c-20 34 -33 80 -37 137c0 5 -1 10 -1 15c0 42 12 86 35 132c23 44 51 82 86 115s75 65 119 98c-2 12 -7 36 -11 72c-3 33 -3 57 -3 69c0 91 12 134 53 200c26 42 50 63 69 63 c16 0 34 -23 54 -71s30 -90 32 -124v-11c0 -85 -16 -126 -52 -187c-10 -16 -49 -70 -76 -92c-10 -7 -20 -15 -29 -23l24 -140c6 1 14 1 22 1c45 0 79 -9 103 -27c46 -33 71 -81 76 -143c1 -5 1 -12 1 -17c0 -96 -68 -163 -141 -193c6 -44 14 -86 20 -126c4 -24 4 -45 4 -62 c0 -23 -3 -41 -10 -54c-27 -50 -69 -77 -123 -80c-4 0 -9 -1 -13 -1c-29 0 -56 8 -84 21c-39 19 -60 46 -62 82v8c0 23 6 43 16 59c14 22 35 32 61 34h5c38 0 72 -32 75 -67v-7c0 -40 -26 -67 -81 -83c13 -19 39 -28 79 -28c48 0 90 34 109 67c7 12 10 31 10 57 c0 16 -1 33 -4 52c-6 41 -14 83 -20 124zM358 730c-74 0 -105 -137 -105 -223c0 -19 2 -37 4 -55c39 30 72 64 99 100c31 41 46 77 46 108v7c-3 41 -16 63 -42 63h-2zM315 92l42 -253c57 19 86 61 86 125c0 5 0 12 -1 18c-5 74 -44 110 -117 110h-10zM297 91 c-56 -2 -100 -36 -100 -93v-6c2 -36 34 -77 59 -89c-2 -2 -6 -4 -8 -8c-54 26 -91 69 -96 134v8c0 53 35 98 69 124c18 13 37 23 60 28l-22 132c-16 -10 -41 -29 -72 -57c-39 -34 -66 -65 -84 -92c-35 -54 -52 -102 -52 -142v-10c4 -53 27 -99 72 -137s96 -56 157 -56 c19 0 40 2 59 7c-15 86 -28 172 -42 257z'
        break
      case 'C':
        d = 'M175 502h43v-456c10 5 18 12 37 29c16 19 22 27 27 38s8 24 14 49c3 22 5 43 5 62c7 -34 31 -54 73 -60c73 18 99 61 100 165c0 46 -10 78 -31 100c-18 23 -41 35 -69 35c-40 0 -65 -32 -66 -84c6 12 11 16 39 24c5 0 2 1 16 -4l17 -10l10 -14l7 -18 c-4 -32 -23 -48 -56 -48c-51 0 -77 33 -77 98c10 35 16 47 30 61c9 9 15 14 23 17c3 3 22 9 27 11l34 3l35 2c123 0 192 -64 192 -178l1 -33c0 -52 -20 -97 -60 -134c-18 -15 -42 -28 -74 -39c-30 -9 -63 -13 -101 -13l-93 -88v-34l93 -88c38 0 71 -4 101 -13 c32 -11 56 -24 74 -39c40 -37 60 -82 60 -134l-3 -33c0 -115 -68 -178 -190 -178l-35 2l-34 3c-5 2 -24 8 -27 11c-26 11 -40 32 -53 78c0 65 26 98 77 98c33 0 52 -16 56 -48l-7 -18l-10 -14l-17 -10c-14 -5 -11 -4 -16 -4c-28 8 -33 12 -39 24c1 -52 26 -84 66 -84 c28 0 51 12 69 35c21 22 31 54 31 100c-1 104 -27 147 -100 165c-42 -6 -66 -26 -73 -60c0 19 -2 40 -5 62c-6 25 -9 38 -14 49s-11 19 -27 38c-19 17 -27 24 -37 29v-456h-43v1004zM0 502h118v-1004h-118v1004z'
        break
      case 'F':
        d = 'M509 -105c0 28 22 51 50 51s51 -23 51 -51s-23 -51 -51 -51s-50 23 -50 51zM509 105c0 28 22 51 50 51s51 -23 51 -51s-23 -51 -51 -51s-50 23 -50 51zM138 84c43 0 63 -11 77 -43l14 -34c0 -16 -2 -27 -6 -35c-2 -9 -8 -17 -17 -27c-22 -24 -49 -38 -73 -38 c-43 0 -63 8 -98 39c-20 18 -31 47 -31 87c0 34 9 65 28 98c26 45 62 69 120 81l32 6l22 1c125 0 203 -51 240 -159c10 -30 15 -61 15 -93c0 -83 -19 -154 -59 -219c-70 -115 -185 -194 -360 -251l-26 -5c-8 0 -13 3 -13 7c2 7 3 8 9 14c47 20 66 30 84 39l68 37 c89 53 143 125 172 226c13 48 17 60 20 87c3 19 4 31 5 34c-5 51 -12 95 -20 123c-8 30 -5 22 -14 35c-6 9 -14 17 -27 29c-29 26 -64 39 -103 39c-44 0 -75 -8 -99 -25c-24 -16 -37 -38 -37 -64v-14c2 -4 3 -7 4 -9c25 23 49 34 73 34z'
        break
      default:
        d = ''
    }
    path.setAttribute('d', d)
    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  // Calculate loc from line: line 1 -> loc 0, line 2 -> loc 2, ..., line 5 -> loc 8
  const line = parseInt(clefObj.line, 10)
  const loc = (line - 1) * 2

  // Create the clef group
  const clefG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  clefG.setAttribute('class', 'clef')
  clefG.setAttribute('data-id', clefObj.id)

  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symbolId}`)
  use.setAttribute('height', clefHeight + 'px')
  use.setAttribute('width', clefWidth + 'px')

  const x = rastrumX + (clefObj.x * context.options.baseScaling || 0)
  const y = loc0Y - (loc * vuStepSize)

  use.setAttribute('x', x)
  use.setAttribute('y', y)
  clefG.appendChild(use)

  staffG.appendChild(clefG)
}
