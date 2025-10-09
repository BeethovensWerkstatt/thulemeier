/**
 * Render empty staves into the given SVG document
 * @param {Document} meiDocument - MEI document
 * @param {SVGElement} svg - SVG element to render into
 * @param {Object} options - Rendering options
 */
export function renderRastrums (meiDocument, svg, context) {
  // Use svg.ownerDocument if available, otherwise global document (browser)
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  rastrumGroup.setAttribute('class', 'rastrums')

  // Get rastrums from context
  const rastrums = context.rastrums
  rastrums.forEach((rastrum, i) => {
    const width = rastrum.svgW
    const height = rastrum.svgH
    const x = rastrum.svgX
    const y = rastrum.svgY

    // Create group for each rastrum
    const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'rastrum')
    g.setAttribute('data-id', rastrum.id)

    // Add group for bounding box for debugging
    const bboxG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    bboxG.setAttribute('class', 'rastrum bounding-box')
    bboxG.setAttribute('data-id', 'bbox-' + rastrum.id)

    // Draw bounding box for debugging
    const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', width)
    rect.setAttribute('height', height)
    rect.setAttribute('fill', '#ff000033')
    bboxG.appendChild(rect)

    g.appendChild(bboxG)

    // Draw rastrum lines
    for (let line = 4; line >= 0; line--) {
      const lineY = Math.round((rastrum.loc0Y - line * rastrum.vuStepSize * 2) * 100) / 100
      const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${Math.round(x * 100) / 100} ${lineY} L${Math.round((x + width) * 100) / 100} ${lineY}`)
      path.setAttribute('stroke-width', '10')
      path.setAttribute('stroke', 'black')
      g.appendChild(path)
    }

    // TODO: rotation
    g.setAttribute('style', 'transform: rotate(' + rastrum.rotate + 'deg);')

    /*
    <rect x="1905" y="1465" height="598" width="22460" fill="transparent"></rect>
    <path d="M1910 1470 L24360 1470" stroke-width="10"></path>
    <path d="M1910 1617 L24360 1617" stroke-width="10"></path>
    <path d="M1910 1764 L24360 1764" stroke-width="10"></path>
    <path d="M1910 1911 L24360 1911" stroke-width="10"></path>
    <path d="M1910 2058 L24360 2058" stroke-width="10"></path>
    */

    rastrumGroup.appendChild(g)
  })

  svg.appendChild(rastrumGroup)
}
