const beamLineWidth = 90

/**
 * Renders a single beam line into the given staff group
 * @param {Object} beamObj - the beam object with x, y, x2, y2
 * @param {SVGElement} staffG - the staff group element to render the beam into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderBeam (beamObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // All coordinates are measured from the top line of the rastrum
  const x1 = rastrumX + (beamObj.x * context.options.baseScaling || 0)
  const y1 = rastrumY + (beamObj.y * context.options.baseScaling || 0)
  const x2 = rastrumX + (beamObj.x2 * context.options.baseScaling || 0)
  const y2 = rastrumY + (beamObj.y2 * context.options.baseScaling || 0)

  // Create the beam group
  const beamG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  beamG.setAttribute('class', 'beam')
  beamG.setAttribute('data-id', beamObj.id)

  /*
  <polygon
    stroke-opacity="1"
    fill-opacity="1"
    points="13101,2055 14067,1695 14067,1605 13101,1965"/>
  */

  const polygon = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  polygon.setAttribute('points', `${x1},${y1 - beamLineWidth} ${x2},${y2 - beamLineWidth} ${x2},${y2} ${x1},${y1}`)
  polygon.setAttribute('stroke-opacity', 1)
  polygon.setAttribute('fill-opacity', 1)

  beamG.appendChild(polygon)
  staffG.appendChild(beamG)
}
