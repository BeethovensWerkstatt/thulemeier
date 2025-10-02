import { render, supportedModes, version } from './index.js'
import { loadMEI } from './src/utils/load-mei.js'

const meiPath = './test/2025-09_thulemeier_test.xml'
const outputPath = './test/output.svg' // Desired output file path
const outputPagePath = './test/output-page.svg' // Desired output file path
// const outputDraftPath = './test/output-draft.svg' // Desired output file path

async function main () {
  try {
    const meiDoc = await loadMEI(meiPath)
    // Pass outputPath as an option
    const svg = await render(meiDoc, { mode: 'fullPage', outputPath })
    console.log('Rendering of ' + meiPath + ' successful!')
    console.log('SVG saved to:', outputPath)
    console.log('mei notes: ', meiDoc.querySelectorAll('note').length)
    console.log('svg notes: ', svg.querySelectorAll('g.note').length)
    console.log('Supported modes:', supportedModes())
    console.log('Version:', version())

    // Render empty page
    const svgPage = await render(meiDoc, { mode: 'emptyPage', outputPath: outputPagePath })
    console.log('Empty page rendering successful!')
    console.log('SVG saved to:', outputPagePath)
    console.log('svg notes on empty page: ', svgPage.querySelectorAll('g.note').length)

    // Render single draft (replace 'draft1' with an actual draft ID from your MEI file)
    /* const draftId = 'd9422e4cd-4883-4717-8cc4-56f6f1d15e57' // Example draft ID
    const svgDraft = await render(meiDoc, { mode: 'singleDraft', id: draftId, outputPath: outputDraftPath })
    console.log('Single draft rendering successful!')
    console.log('SVG saved to:', outputDraftPath)
    console.log('svg notes in single draft: ', svgDraft.querySelectorAll('g.note').length) */
  } catch (error) {
    console.error('Rendering failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

main()
