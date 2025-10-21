const defaultFontSize = 303

/**
 * Renders a single f (figured bass) element into the given system group
 * @param {Object} fObj - the f object with x, y, id, content properties
 * @param {SVGElement} systemG - the system group element to render the f into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderF (fObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (fObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (fObj.y * context.options.baseScaling || 0)

  const textContent = fObj.content || ''

  // Create the f group
  const fG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  fG.setAttribute('class', 'f' + (fObj.unclear ? ' unclear' : ''))
  fG.setAttribute('data-id', fObj.id)
  fG.setAttribute('data-class', 'f' + (fObj.unclear ? ' unclear' : ''))

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', fObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  fG.appendChild(textEl)
  systemG.appendChild(fG)
}
