const barLineWidth = 27

/**
 * Renders a single bar line into the given staff group
 * @param {Object} barLineObj - the barLine object with x, y, x2, y2
 * @param {SVGElement} staffG - the staff group element to render the bar line into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderBarLine (barLineObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // All coordinates are measured from the top line of the rastrum
  const x1 = rastrumX + (barLineObj.x * context.options.baseScaling || 0)
  const y1 = rastrumY + (barLineObj.y * context.options.baseScaling || 0)
  const x2 = rastrumX + (barLineObj.x2 * context.options.baseScaling || 0)
  const y2 = rastrumY + (barLineObj.y2 * context.options.baseScaling || 0)

  // Create the bar line group
  const barLineG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  barLineG.setAttribute('class', 'barLine')
  barLineG.setAttribute('data-id', barLineObj.id)

  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', `M${x1} ${y1} L${x2} ${y2}`)
  path.setAttribute('stroke-width', barLineWidth)
  // path.setAttribute('stroke', 'black')

  barLineG.appendChild(path)
  staffG.appendChild(barLineG)
}
