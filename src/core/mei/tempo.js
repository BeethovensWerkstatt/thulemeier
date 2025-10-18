const defaultFontSize = 405

/**
 * Renders a single tempo marking into the given system group
 * @param {Object} tempoObj - the tempo object with x, y, width, text
 * @param {SVGElement} systemG - the system group element to render the tempo into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderTempo (tempoObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (tempoObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (tempoObj.y * context.options.baseScaling || 0)
  const textLength = tempoObj.width ? (tempoObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = tempoObj.content || ''

  // Create the tempo group
  const tempoG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  tempoG.setAttribute('class', 'tempo')
  tempoG.setAttribute('data-id', tempoObj.id)
  tempoG.setAttribute('data-class', 'tempo')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  const tspanOuter = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanOuter.setAttribute('id', tempoObj.id + '_tspan')
  tspanOuter.setAttribute('class', 'text')

  const tspanInner = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  tspanInner.setAttribute('font-size', defaultFontSize + 'px')
  tspanInner.setAttribute('font-weight', 'bold')
  tspanInner.textContent = textContent

  tspanOuter.appendChild(tspanInner)
  textEl.appendChild(tspanOuter)
  tempoG.appendChild(textEl)
  systemG.appendChild(tempoG)
}
