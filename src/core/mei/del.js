/**
 * Renders a single deletion for a given draft, the dimensions are page-based
 * @param {Object} del - the deletion object parsed from MEI in mei-parser.js
 * @param {SVGElement} containerG - the staff group element to render the deletion into
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderDel (del, containerG, context, svg) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('data-id', del.id)
  g.setAttribute('data-class', 'deletion')
  g.setAttribute('class', 'deletion')

  containerG.append(g)

  const points = del.path.split(' ')

  // scale points to Verovio output scale
  const scalePoint = (point) => {
    const command = point.substring(0, 1)

    let out
    if (point.length > 1) {
      const x = parseFloat(point.substring(1).split(',')[0])
      const y = parseFloat(point.substring(1).split(',')[1])
      const factor = 90 // 9px per vu, factor 10 as general factor of Verovio
      out = (x * factor).toFixed(1) + ',' + (y * factor).toFixed(1)
    } else {
      out = ''
    }
    return command + out
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('data-id', del.id)
  path.setAttribute('d', points.map(scalePoint).join(' '))
  path.classList.add('deletionBack')
  g.append(path)

  const diagonal1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  diagonal1.setAttribute('d', scalePoint(points[0]) + ' ' + scalePoint(points[2]))
  diagonal1.setAttribute('stroke-width', '9')
  diagonal1.classList.add('deletionLine')
  g.append(diagonal1)

  const diagonal2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  diagonal2.setAttribute('d', scalePoint(points[1]).replace('L', 'M') + ' ' + scalePoint(points[3]))
  diagonal2.setAttribute('stroke-width', '9')
  diagonal2.classList.add('deletionLine')
  g.append(diagonal2)
}
