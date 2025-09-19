import { render, supportedModes, version } from './index.js'
import { loadMEI } from './src/utils/load-mei.js'

const meiPath = './test/2025-09_thulemeier_test.xml'
const outputPath = './test/output.svg' // Desired output file path

async function main () {
  try {
    const meiDoc = await loadMEI(meiPath)
    // Pass outputPath as an option
    const svg = await render(meiDoc, { mode: 'fullPage', outputPath })
    console.log('Rendering successful!')
    console.log('SVG saved to:', outputPath)
    console.log('mei notes: ', meiDoc.querySelectorAll('note').length)
    console.log('svg notes: ', svg.querySelectorAll('g.note').length)
    console.log('Supported modes:', supportedModes())
    console.log('Version:', version())
  } catch (error) {
    console.error('Rendering failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

main()
