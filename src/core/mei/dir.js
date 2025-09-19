const defaultFontSize = 405

/**
 * Renders a single direction (dir) into the given staff group
 * @param {Object} dirObj - the dir object with x, y, width, text
 * @param {SVGElement} staffG - the staff group element to render the direction into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderDir (dirObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  console.log('Rendering dir:', dirObj)
  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (dirObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (dirObj.y * context.options.baseScaling || 0)
  const textLength = dirObj.width ? (dirObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = dirObj.content || ''

  // Create the direction group
  const dirG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  dirG.setAttribute('class', 'dir')
  dirG.setAttribute('data-id', dirObj.id)
  dirG.setAttribute('data-class', 'dir')
  dirG.setAttribute('id', dirObj.id)
  dirG.setAttribute('style', 'font-style: italic;')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', dirObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  dirG.appendChild(textEl)
  staffG.appendChild(dirG)
}
