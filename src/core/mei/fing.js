const defaultFontSize = 303

/**
 * Renders a single fing (fingering) element into the given system group
 * @param {Object} fingObj - the fing object with x, y, id, content properties
 * @param {SVGElement} systemG - the system group element to render the fing into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderFing (fingObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (fingObj.x * scale)
  // Special y calculation with font size offset (fontSize / 90 in original)
  const y = rastrumY + ((fingObj.y + (defaultFontSize / 90)) * scale)
  const textContent = fingObj.content || ''

  // Create the fing group
  const fingG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  fingG.setAttribute('class', 'fing')
  fingG.setAttribute('data-id', fingObj.id)
  fingG.setAttribute('data-class', 'fing')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', fingObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  fingG.appendChild(textEl)
  systemG.appendChild(fingG)
}
