const defaultTupletNumFontSize = 303

/**
 * Renders a single num (tuplet number) element into the given system group
 * @param {Object} numObj - the num object with x, y, id, content properties
 * @param {SVGElement} systemG - the system group element to render the num into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderNum (numObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const defaultFontSize = numObj.type === 'tuplet' ? defaultTupletNumFontSize : 303

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x = rastrumX + (numObj.x * scale)
  // Special y calculation with font size offset (fontSize / 90 in original)
  const y = rastrumY + ((numObj.y + (defaultFontSize / 90)) * scale)
  const textContent = numObj.content || ''

  // Create the num group
  const numG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  numG.setAttribute('class', 'num ' + numObj.type + (numObj.unclear ? ' unclear' : ''))
  numG.setAttribute('data-id', numObj.id)
  numG.setAttribute('data-class', 'num ' + numObj.type + (numObj.unclear ? ' unclear' : ''))

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', numObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  numG.appendChild(textEl)
  systemG.appendChild(numG)
}
