// Conditional DOM API setup
let document

async function initializeDOMAPIs () {
  if (typeof window !== 'undefined') {
    // Browser environment
    document = window.document
  } else {
    // Node.js environment - dynamically import jsdom
    try {
      const { JSDOM } = await import('jsdom')
      const dom = new JSDOM()
      document = dom.window.document
    } catch (error) {
      throw new Error('jsdom is required for Node.js support. Install it with: npm install jsdom')
    }
  }
}

// Initialize DOM APIs once
const domAPIsReady = initializeDOMAPIs()

/**
 * Create SVG container element
 * @param {Object} dimensions - Dimension settings
 * @param {Object} options - Additional options
 * @returns {Promise<SVGElement>} SVG container
 */
export async function createSVGContainer (dimensions, options = {}) {
  // Ensure DOM APIs are ready
  await domAPIsReady

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', (+dimensions.width * 2.5) + 'px')
  svg.setAttribute('height', (+dimensions.height * 2.5) + 'px')
  svg.setAttribute('viewBox', dimensions.viewBox)
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('version', '1.1')
  svg.setAttribute('overflow', 'visible')

  // Add metadata
  const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc')
  desc.textContent = options.title || 'Thulemeier MEI Rendering'
  svg.appendChild(desc)

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

  // Add default CSS styles
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.setAttribute('type', 'text/css')

  // Default CSS rules
  const defaultCSS = `
    .staff * {
      fill: #000;
      stroke: #000;
    }

    .deletionBack {
      fill: #00000033;
    }
  `
  style.textContent = defaultCSS
  defs.appendChild(style)

  svg.appendChild(defs)

  return svg
}

/**
 * Create placeholder text element
 * @param {string} text - Text content
 * @param {Object} position - Position {x, y}
 * @param {Object} style - Style options
 * @returns {Promise<SVGElement>} Text element
 */
export async function createTextElement (text, position = { x: 50, y: 50 }, style = {}) {
  // Ensure DOM APIs are ready
  await domAPIsReady

  const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textElement.setAttribute('x', position.x)
  textElement.setAttribute('y', position.y)
  textElement.setAttribute('font-family', style.fontFamily || 'Arial, sans-serif')
  textElement.setAttribute('font-size', style.fontSize || '16')
  textElement.setAttribute('fill', style.fill || '#333')
  textElement.textContent = text
  return textElement
}
