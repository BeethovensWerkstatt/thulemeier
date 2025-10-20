const lineWidth = 45

/**
 * Renders a single line into the given staff group
 * @param {Object} lineObj - the line object with x, y, x2, y2
 * @param {SVGElement} staffG - the staff group element to render the line into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderLine (lineObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // All coordinates are measured from the top line of the rastrum
  const x1 = rastrumX + (lineObj.x * context.options.baseScaling || 0)
  const y1 = rastrumY + (lineObj.y * context.options.baseScaling || 0)
  const x2 = rastrumX + (lineObj.x2 * context.options.baseScaling || 0)
  const y2 = rastrumY + (lineObj.y2 * context.options.baseScaling || 0)

  // Create the line group
  const lineG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  lineG.setAttribute('class', 'line ' + lineObj.func)
  lineG.setAttribute('data-class', 'line ' + lineObj.func)
  lineG.setAttribute('data-id', lineObj.id)
  lineG.setAttribute('style', 'transform: rotate(' + rastrum.rotate + 'deg); transform-origin: ' + rastrumX + 'px ' + rastrumY + 'px;')

  /*
  <polygon
    stroke-opacity="1"
    fill-opacity="1"
    points="13101,2055 14067,1695 14067,1605 13101,1965"/>
  */

  const polygon = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  polygon.setAttribute('points', `${x1},${y1 - lineWidth} ${x2},${y2 - lineWidth} ${x2},${y2} ${x1},${y1}`)
  polygon.setAttribute('stroke-opacity', 1)
  polygon.setAttribute('fill-opacity', 1)

  lineG.appendChild(polygon)
  staffG.appendChild(lineG)
}
