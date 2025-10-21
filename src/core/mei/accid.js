const accidWidth = 480
const accidHeight = 480

/**
 * Renders a single accidental into the given staff group
 * @param {Object} accidObj - the accidental object with loc, x, accid
 * @param {SVGElement} staffG - the staff group element to render the accidental into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderAccid (accidObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const accidType = accidObj.accid // 's', 'f', 'n'
  const symbolId = 'sym_accid_' + accidType

  const defs = svg.querySelector('defs')
  const symbolAvailable = defs.querySelector('#' + symbolId)

  if (!symbolAvailable) {
    // You can add your own path d values for each accidental type
    const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', symbolId)
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')
    let d = ''
    switch (accidType) {
      case 's': // sharp
        d = 'M136 186v169h17v-164l44 14v-91l-44 -14v-165l44 12v-91l-44 -13v-155h-17v150l-76 -22v-155h-17v149l-43 -13v90l43 14v167l-43 -14v92l43 13v169h17v-163zM60 73v-167l76 22v168z'
        break
      case 'f': // flat
        d = 'M20 110c32 16 54 27 93 27c26 0 35 -3 54 -13c13 -7 24 -20 27 -38l4 -25c0 -28 -16 -57 -45 -89c-23 -25 -39 -44 -65 -68l-88 -79v644h20v-359zM90 106c-32 0 -48 -10 -70 -29v-194c31 31 54 59 71 84c21 32 32 59 32 84c0 9 1 16 1 20c0 14 -3 21 -11 30l-8 3z'
        break
      case 'n': // natural
        d = 'M0 -188v539h18v-191l139 22v-533h-17v186zM18 -100l122 17v176l-122 -19v-174z'
        break
      default:
        d = ''
    }
    path.setAttribute('d', d)
    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  // Create the accidental group
  const accidG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  accidG.setAttribute('class', 'accid' + (accidObj.unclear ? ' unclear' : ''))
  accidG.setAttribute('data-id', accidObj.id)

  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symbolId}`)
  use.setAttribute('height', accidHeight + 'px')
  use.setAttribute('width', accidWidth + 'px')

  const x = rastrumX + (accidObj.x * context.options.baseScaling || 0)
  const y = loc0Y - (accidObj.loc * vuStepSize)

  use.setAttribute('x', x)
  use.setAttribute('y', y)
  accidG.appendChild(use)

  staffG.appendChild(accidG)
}
