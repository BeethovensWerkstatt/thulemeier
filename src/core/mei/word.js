/**
 * Renders a single word text element into the given staff group
 * @param {Object} wordObj - the word object with x, y, id, staff, width, textContent properties
 * @param {SVGElement} systemG - the system group element to render the word into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderWord (wordObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const fontSize = 360 // font size from original implementation
  const x = rastrumX + (wordObj.x * scale)
  // Special y calculation with font size offset (fontSize / factor in original)
  const y = rastrumY + ((wordObj.y + (fontSize / 90)) * scale)
  const width = (wordObj.width || 0) * scale

  // Create the word group
  const wordG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  wordG.setAttribute('class', 'word')
  wordG.setAttribute('data-id', wordObj.id)
  wordG.setAttribute('data-class', 'word')

  // Create the text element
  const text = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.setAttribute('x', x)
  text.setAttribute('y', y)
  text.setAttribute('text-anchor', 'start')
  text.setAttribute('font-size', '0px')
  if (width > 0) {
    text.setAttribute('textLength', width + 'px')
  }

  // Create outer tspan
  const outerTspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  outerTspan.setAttribute('id', wordObj.id + '_tspan')
  outerTspan.setAttribute('class', 'text')

  // Create inner tspan with actual font size and text content
  const innerTspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
  innerTspan.setAttribute('font-size', fontSize + 'px')
  innerTspan.textContent = wordObj.content || ''

  // Assemble the hierarchy
  outerTspan.appendChild(innerTspan)
  text.appendChild(outerTspan)
  wordG.appendChild(text)
  systemG.appendChild(wordG)
}
