const defaultFontSize = 555

/**
 * Renders a single clarification into the given system group
 * @param {Object} clarificationObj - the clarification object with x, y, width, text
 * @param {SVGElement} systemG - the system group element to render the clarification into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderMetaMarkClarification (clarificationObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (clarificationObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (clarificationObj.y * context.options.baseScaling || 0)
  const textLength = clarificationObj.width ? (clarificationObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = clarificationObj.content || ''

  // Create the clarification group
  const clarificationG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  clarificationG.setAttribute('class', 'clarification')
  clarificationG.setAttribute('data-id', clarificationObj.id)
  clarificationG.setAttribute('data-class', 'clarification')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', clarificationObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.setAttribute('font-weight', 'bold')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  clarificationG.appendChild(textEl)
  systemG.appendChild(clarificationG)
}

/**
 * Renders a single navigation mark into the given system group
 * @param {Object} navigationObj - the navigation object with x, y, width, text
 * @param {SVGElement} systemG - the system group element to render the navigation into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderMetaMarkNavigation (navigationObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (navigationObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (navigationObj.y * context.options.baseScaling || 0)
  const textLength = navigationObj.width ? (navigationObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = navigationObj.content || ''

  // Create the navigation group
  const navigationG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  navigationG.setAttribute('class', 'metaMark navigation')
  navigationG.setAttribute('data-id', navigationObj.id)
  navigationG.setAttribute('data-class', 'metaMark navigation')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', navigationObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.setAttribute('font-weight', 'bold')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  navigationG.appendChild(textEl)
  systemG.appendChild(navigationG)
}
