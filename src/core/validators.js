/**
 * Validate input parameters
 * @param {*} input - Input to validate
 * @param {Object} options - Rendering options
 */
export function validateInput (input, options) {
  if (!input) {
    throw new Error('Input MEI document is required')
  }

  const supportedModes = ['fullPage']
  if (!supportedModes.includes(options.mode)) {
    throw new Error(`Unsupported rendering mode: ${options.mode}. Supported modes: ${supportedModes.join(', ')}`)
  }

  if (
    typeof input !== 'string' &&
    !(input && typeof input.querySelector === 'function' && input.nodeType === 9)
  ) {
    throw new Error('Input must be an XML string or DOM Document')
  }
}

/**
 * Validate MEI document structure
 * @param {Document} meiDocument - MEI document to validate
 */
export function validateMeiDocument (meiDocument) {
  const root = meiDocument.documentElement

  if (!root || root.localName !== 'mei') {
    throw new Error('Invalid MEI document: root element must be <mei>')
  }

  // Check for required namespace
  const meiNamespace = 'http://www.music-encoding.org/ns/mei'
  if (root.namespaceURI !== meiNamespace) {
    console.warn(`MEI namespace not found or incorrect. Expected: ${meiNamespace}`)
  }
}
