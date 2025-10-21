const restWidth = 597
const restHeight = 597

/**
 * Renders a single rest into the given staff group
 * @param {Object} rest - the rest object parsed from MEI in mei-parser.js
 * @param {SVGElement} staffG - the staff group element to render the rest into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderRest (rest, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const restType = rest.type || 'restQuarter'
  const symbolId = 'sym_rest_' + restType

  const defs = svg.querySelector('defs')
  const symbolAvailable = defs.querySelector('#' + symbolId)

  if (!symbolAvailable) {
    // console.warn(`Rest symbol ${symbolId} not found in SVG defs`)
    const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', symbolId)
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')

    let d
    switch (restType) {
      case 'restWhole':
        d = 'M100 500h800v100H100z' // Example path for whole rest
        break
      case 'restHalf':
        d = 'M0 10v105c0 9 1 10 10 10h280c9 0 10 -1 10 -10v-105c0 -9 -1 -10 -10 -10h-280c-9 0 -10 1 -10 10z'
        break
      case 'rest8th':
        d = 'M0 123c7 34 33 56 69 60c29 -3 43 -9 53 -29c4 -8 7 -15 10 -22c0 -21 -1 -25 -11 -35c-5 -8 -18 -14 -40 -20l12 -3l15 -1c44 0 97 26 122 56c10 11 18 26 24 42c7 1 15 2 22 3l-140 -424h-36l111 330c-10 -6 -27 -12 -53 -16l-52 -8h-10l-20 1c-1 0 -8 3 -21 6 c-37 9 -55 28 -55 60z'
        break
      case 'restQuarter':
      default:
        d = 'M107 292c-13 24 -30 49 -52 71c-1 1 0 2 0 3l-2 2c3 3 4 4 6 4c12 0 26 -7 40 -20s44 -40 89 -81c26 -24 28 -29 46 -47c4 -4 8 -9 10 -14c6 -8 8 -16 8 -27c0 -19 -12 -40 -36 -61c-28 -23 -49 -38 -61 -73c-4 -11 -7 -27 -10 -50c13 -43 34 -83 59 -121 c31 -47 59 -79 101 -129c-8 0 -26 7 -54 20l-62 29l-21 6l-23 1c-25 0 -45 -10 -60 -30l-4 -14l-1 -12c0 -33 20 -56 39 -78c8 -9 17 -18 26 -26c17 -15 27 -24 28 -30l-3 -3c-11 5 -19 10 -25 15c-9 3 -37 21 -45 26c-24 14 -45 32 -63 51c-19 21 -37 44 -37 71 c0 63 27 95 80 95c41 0 86 -18 136 -52c-19 26 -37 48 -55 66c-23 23 -48 44 -73 65c-28 23 -47 40 -58 53s-17 26 -18 39c75 64 113 125 113 183c0 27 -7 48 -18 68z' // Example path for quarter rest
        break
    }
    path.setAttribute('d', d)
    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  // Create the rest group
  const restG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  restG.setAttribute('class', 'rest' + (rest.unclear ? ' unclear' : ''))
  restG.setAttribute('data-id', rest.id)

  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symbolId}`)
  use.setAttribute('height', restHeight + 'px')
  use.setAttribute('width', restWidth + 'px')

  const x = rastrumX + (rest.x * context.options.baseScaling || 0)
  const y = loc0Y - (rest.loc * vuStepSize)

  use.setAttribute('x', x)
  use.setAttribute('y', y)
  restG.appendChild(use)

  staffG.appendChild(restG)
}
