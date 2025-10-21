const curveStrokeWidth = 9

/**
 * Renders a curve (bezier) into the given staff group
 * @param {Object} curveObj - the curve object with bezier string
 * @param {SVGElement} staffG - the staff group element to render the curve into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderCurve (curveObj, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const rastrumY = rastrum.svgY

  // Parse bezier string into array of points
  // Format: "x1 y1 x2 y2 x3 y3 x4 y4"
  const bezierPoints = curveObj.bezier.trim().split(/\s+/).map(Number)
  if (bezierPoints.length !== 8) throw new Error('Bezier must have 8 numbers (4 points)')

  // Scale and offset all points
  const scale = context.options.baseScaling || 1
  const Q = []
  for (let i = 0; i < 8; i += 2) {
    Q.push(rastrumX + bezierPoints[i] * scale)
    Q.push(rastrumY + bezierPoints[i + 1] * scale)
  }

  // Use controlpointsToVerovioSvgBezier algorithm for width rendering
  // Inline minimal Vector class for this file
  class Vector {
    constructor (x, y) { this.x = x; this.y = y }
    add (v) { return new Vector(this.x + v.x, this.y + v.y) }
    sub (v) { return new Vector(this.x - v.x, this.y - v.y) }
    mul (s) { return new Vector(this.x * s, this.y * s) }
    div (s) { return new Vector(this.x / s, this.y / s) }
    length () { return Math.sqrt(this.x ** 2 + this.y ** 2) }
    normalize () { const l = this.length(); return new Vector(this.x / l, this.y / l) }
    toString () { return `${this.x.toFixed(2)},${this.y.toFixed(2)}` }
  }

  // Helper: main curve path (double-curve with offset for thickness)
  function controlpointsToDoubleBezier (Q, thickness = 40) {
    if (!Q?.length) return ''
    const c1 = new Vector(Q[0], Q[1])
    const c2 = new Vector(Q[2], Q[3])
    const c3 = new Vector(Q[4], Q[5])
    const c4 = new Vector(Q[6], Q[7])

    // Calculate perpendicular offset at c2 and c3
    // For c2: direction is c3-c1
    const dir2 = c3.sub(c1).normalize()
    const perp2 = new Vector(-dir2.y, dir2.x)
    const c2p = c2.add(perp2.mul(thickness))

    // For c3: direction is c4-c2
    const dir3 = c4.sub(c2).normalize()
    const perp3 = new Vector(-dir3.y, dir3.x)
    const c3p = c3.add(perp3.mul(thickness))

    // M c1 C c2 c3 c4 C c3p c2p c1
    return `M${c1} C${c2} ${c3} ${c4} C${c3p} ${c2p} ${c1}`
  }

  // Thickness can be derived from scaling or set as a constant
  const thickness = 0.7 * (context.options.baseScaling || 40)
  const d = controlpointsToDoubleBezier(Q, thickness)

  // Create the curve group
  const curveG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  curveG.setAttribute('class', 'curve' + (curveObj.unclear ? ' unclear' : ''))
  curveG.setAttribute('data-id', curveObj.id)
  curveG.setAttribute('data-class', 'curve')

  // Main curve path (double-curve)
  const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', d)
  path.setAttribute('stroke-width', curveStrokeWidth)
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  // path.setAttribute('stroke', 'black')
  curveG.appendChild(path)
  staffG.appendChild(curveG)
}
