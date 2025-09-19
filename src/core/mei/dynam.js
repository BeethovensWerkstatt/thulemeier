const defaultFontSize = 405

/**
 * Renders a single dynamic marking into the given staff group
 * @param {Object} dynamObj - the dynam object with x, y, width, text
 * @param {SVGElement} systemG - the staff group element to render the dynamic into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderDynam (dynamObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (dynamObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (dynamObj.y * context.options.baseScaling || 0)
  const textLength = dynamObj.width ? (dynamObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = dynamObj.text || ''

  // Create the dynamic group
  const dynamG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  dynamG.setAttribute('class', 'dynam')
  dynamG.setAttribute('data-id', dynamObj.id)
  dynamG.setAttribute('data-class', 'dynam')
  dynamG.setAttribute('id', dynamObj.id)

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', dynamObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.setAttribute('font-style', 'italic')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  dynamG.appendChild(textEl)
  systemG.appendChild(dynamG)
}
