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

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  const x = rastrumX + (dirObj.x * context.options.baseScaling || 0)
  const y = rastrumY + (dirObj.y * context.options.baseScaling || 0)
  const textLength = dirObj.width ? (dirObj.width * context.options.baseScaling || 0) + 'px' : undefined
  const textContent = dirObj.content || ''

  // Create the direction group
  const dirG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  dirG.setAttribute('class', 'dir' + (dirObj.unclear ? ' unclear' : ''))
  dirG.setAttribute('data-id', dirObj.id)
  dirG.setAttribute('data-class', 'dir' + (dirObj.unclear ? ' unclear' : ''))
  dirG.setAttribute('id', dirObj.id)
  dirG.setAttribute('style', 'font-style: italic;')

  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', x)
  textEl.setAttribute('y', y)
  textEl.setAttribute('text-anchor', 'start')
  textEl.setAttribute('font-size', '0px')
  if (textLength) textEl.setAttribute('textLength', textLength)

  // mm = rastrum.vuStepSize * 8 / rastrum.h = px/mm
  const pxPerMm = (rastrum.vuStepSize * 8) / rastrum.h
  const lineheight = dirObj.lineheight ? pxPerMm * dirObj.lineheight : pxPerMm * 6
  // Recursively traverse for <lb> elements
  function renderSegmentsFromNode (node, tspanCount = 0) {
    let seg = ''
    let count = tspanCount
    function traverse (n) {
      if (n.nodeType === 3) {
        seg += n.nodeValue
      } else if (n.nodeType === 1) {
        if (/^(lb|mei:lb)$/i.test(n.nodeName)) {
          flushSeg()
        } else if (n.childNodes && n.childNodes.length) {
          for (let i = 0; i < n.childNodes.length; i++) {
            traverse(n.childNodes[i])
          }
        }
      }
    }
    function flushSeg () {
      if (seg.trim()) {
        const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
        tspan.setAttribute('font-size', defaultFontSize + 'px')
        tspan.textContent = seg.trim()
        if (count > 0) {
          tspan.setAttribute('x', x)
          tspan.setAttribute('dy', lineheight)
        }
        textEl.appendChild(tspan)
        count++
      }
      seg = ''
    }
    traverse(node)
    flushSeg()
  }

  if (Array.isArray(dirObj.content)) {
    dirObj.content.forEach((seg, i) => {
      const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      tspan.setAttribute('font-size', defaultFontSize + 'px')
      tspan.textContent = seg
      if (i > 0) {
        tspan.setAttribute('x', x)
        tspan.setAttribute('dy', lineheight)
      }
      textEl.appendChild(tspan)
    })
  } else if (typeof dirObj.content === 'object' && dirObj.content && dirObj.content.childNodes) {
    renderSegmentsFromNode(dirObj.content, 0)
  } else {
    // Fallback: split string content
    const lbRegex = /<\s*(?:mei:)?lb\b[^>]*\/?\s*>/gi
    const segments = textContent.split(lbRegex)
    segments.forEach((seg, i) => {
      const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      tspan.setAttribute('font-size', defaultFontSize + 'px')
      tspan.textContent = seg.trim()
      if (i > 0) {
        tspan.setAttribute('x', x)
        tspan.setAttribute('dy', lineheight)
      }
      textEl.appendChild(tspan)
    })
  }
  if (dirObj.rotation) {
    dirG.setAttribute('style', 'font-style: italic; transform: rotate(' + dirObj.rotation + 'deg); transform-origin: ' + x + 'px ' + y + 'px;')
  }
  dirG.appendChild(textEl)
  staffG.appendChild(dirG)
}
