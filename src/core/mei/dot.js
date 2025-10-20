const dotRadius = 29

/**
 * Renders a single dot into the given staff group
 * @param {Object} dotObj - the dot object with x and loc
 * @param {SVGElement} staffG - the staff group element to render the dot into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderDot (dotObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  // Create the dot group
  const dotG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  dotG.setAttribute('class', 'dot ' + dotObj.type)
  dotG.setAttribute('data-id', dotObj.id)
  dotG.setAttribute('data-class', 'dot ' + dotObj.type)

  // Calculate position
  const cx = rastrumX + (dotObj.x * context.options.baseScaling || 0) - dotRadius
  let cy

  if (dotObj.type === 'augmentation') {
    const loc = dotObj.loc % 2 === 1 ? dotObj.loc : dotObj.loc + 1
    cy = loc0Y - (loc * vuStepSize)
  } else if (dotObj.y) {
    cy = rastrum.svgY + (dotObj.y * context.options.baseScaling || 0) - dotRadius
  }

  // Create the ellipse
  const ellipse = doc.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  ellipse.setAttribute('cx', cx)
  ellipse.setAttribute('cy', cy)
  ellipse.setAttribute('rx', dotRadius)
  ellipse.setAttribute('ry', dotRadius)
  ellipse.setAttribute('fill-opacity', '1')
  ellipse.setAttribute('stroke-opacity', '1')

  dotG.appendChild(ellipse)
  staffG.appendChild(dotG)
}
