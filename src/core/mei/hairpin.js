const hairpinStrokeWidth = 18

/**
 * Renders a single hairpin (crescendo/diminuendo) into the given staff group
 * @param {Object} hairpinObj - the hairpin object with x, y, x2, y2, opening, startOpening, form
 * @param {SVGElement} systemG - the system group element to render the hairpin into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderHairpin (hairpinObj, systemG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Scale coordinates relative to rastrum
  const scale = context.options.baseScaling || 1
  const x1 = rastrumX + (hairpinObj.x * scale)
  const y1 = rastrumY + (hairpinObj.y * scale)
  const x2 = rastrumX + (hairpinObj.x2 * scale)
  const y2 = rastrumY + (hairpinObj.y2 * scale)
  const opening = (hairpinObj.opening || 0) * scale
  const startOpening = (hairpinObj.startOpening || 0) * scale

  // Create the hairpin group
  const hairpinG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  hairpinG.setAttribute('class', 'hairpin')
  hairpinG.setAttribute('data-id', hairpinObj.id)
  hairpinG.setAttribute('data-class', 'hairpin ' + (hairpinObj.form || ''))

  // Create polyline with standard attributes
  function createPolyline () {
    const polyline = doc.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    polyline.setAttribute('stroke', 'currentColor')
    polyline.setAttribute('stroke-width', hairpinStrokeWidth)
    polyline.setAttribute('stroke-opacity', '1')
    polyline.setAttribute('stroke-linecap', 'square')
    polyline.setAttribute('stroke-linejoin', 'miter')
    polyline.setAttribute('fill', 'none')
    return polyline
  }

  // Render based on hairpin type and opening configuration
  if (hairpinObj.form === 'cres') {
    if (startOpening === 0) {
      // Crescendo: closed start -> open end
      // Points: top-right, center-left, bottom-right
      const polyline = createPolyline()
      const points = [
        `${x2.toFixed(1)},${(y2 - opening / 2).toFixed(1)}`,
        `${x1.toFixed(1)},${y1.toFixed(1)}`,
        `${x2.toFixed(1)},${(y2 + opening / 2).toFixed(1)}`
      ]
      polyline.setAttribute('points', points.join(' '))
      hairpinG.appendChild(polyline)
    } else {
      // Crescendo: open start -> more open end (two separate lines)
      const polyline1 = createPolyline()
      const polyline2 = createPolyline()

      // Top line: top-right -> top-left
      polyline1.setAttribute('points',
        `${x2.toFixed(1)},${(y2 - opening / 2).toFixed(1)} ${x1.toFixed(1)},${(y1 - startOpening / 2).toFixed(1)}`
      )

      // Bottom line: bottom-left -> bottom-right
      polyline2.setAttribute('points',
        `${x1.toFixed(1)},${(y1 + startOpening / 2).toFixed(1)} ${x2.toFixed(1)},${(y2 + opening / 2).toFixed(1)}`
      )

      hairpinG.appendChild(polyline1)
      hairpinG.appendChild(polyline2)
    }
  } else if (hairpinObj.form === 'dim') {
    if (startOpening === 0) {
      // Diminuendo: closed end <- open start
      // Points: top-left, center-right, bottom-left
      const polyline = createPolyline()
      const points = [
        `${x1.toFixed(1)},${(y1 - opening / 2).toFixed(1)}`,
        `${x2.toFixed(1)},${y2.toFixed(1)}`,
        `${x1.toFixed(1)},${(y1 + opening / 2).toFixed(1)}`
      ]
      polyline.setAttribute('points', points.join(' '))
      hairpinG.appendChild(polyline)
    } else {
      // Diminuendo: open start -> more open end (two separate lines)
      const polyline1 = createPolyline()
      const polyline2 = createPolyline()

      // Top line: top-left -> top-right
      polyline1.setAttribute('points',
        `${x1.toFixed(1)},${(y1 - opening / 2).toFixed(1)} ${x2.toFixed(1)},${(y2 - startOpening / 2).toFixed(1)}`
      )

      // Bottom line: bottom-right -> bottom-left
      polyline2.setAttribute('points',
        `${x2.toFixed(1)},${(y2 + startOpening / 2).toFixed(1)} ${x1.toFixed(1)},${(y1 + opening / 2).toFixed(1)}`
      )

      hairpinG.appendChild(polyline1)
      hairpinG.appendChild(polyline2)
    }
  }

  systemG.appendChild(hairpinG)
}
