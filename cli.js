#!/usr/bin/env node

import { render, supportedModes } from './index.js'
import { loadMEI } from './src/utils/load-mei.js'

const modeNames = supportedModes()

function printUsage () {
  console.log('Usage: thulemeier <input.mei.xml> <output.svg> [options]')
  console.log('')
  console.log('Options:')
  console.log('  --mode <name>          Rendering mode (default: fullPage)')
  console.log('  --id <draftId>         Required for singleDraft, singleDraftStandalone, singleSystem')
  console.log('  --systemId <systemId>  Required for singleSystem')
  console.log('  --baseScaling <num>    Base scaling value (default: 90)')
  console.log('  -h, --help             Show this help')
  console.log('')
  console.log('Supported modes: ' + modeNames.join(', '))
}

function parseCliArgs (args) {
  const positional = []
  const options = { mode: 'fullPage' }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      return { help: true }
    }

    if (arg === '--mode') {
      options.mode = args[++i]
      continue
    }

    if (arg === '--id') {
      options.id = args[++i]
      continue
    }

    if (arg === '--systemId') {
      options.systemId = args[++i]
      continue
    }

    if (arg === '--baseScaling') {
      const scaling = Number(args[++i])
      if (!Number.isFinite(scaling)) {
        throw new Error('Invalid --baseScaling value. Expected a number.')
      }
      options.baseScaling = scaling
      continue
    }

    if (arg.startsWith('--')) {
      throw new Error('Unknown option: ' + arg)
    }

    positional.push(arg)
  }

  return { help: false, positional, options }
}

function validateOptions (positional, options) {
  if (positional.length !== 2) {
    throw new Error('Expected input and output paths.')
  }

  if (!modeNames.includes(options.mode)) {
    throw new Error('Unsupported mode: ' + options.mode)
  }

  const needsId = ['singleDraft', 'singleDraftStandalone', 'singleSystem']
  if (needsId.includes(options.mode) && !options.id) {
    throw new Error('Mode ' + options.mode + ' requires --id <draftId>.')
  }

  if (options.mode === 'singleSystem' && !options.systemId) {
    throw new Error('Mode singleSystem requires --systemId <systemId>.')
  }
}

async function main () {
  try {
    const { help, positional = [], options = {} } = parseCliArgs(process.argv.slice(2))
    if (help) {
      printUsage()
      return
    }

    validateOptions(positional, options)

    const [inputPath, outputPath] = positional
    const meiDoc = await loadMEI(inputPath)
    await render(meiDoc, { ...options, outputPath })

    console.log('Rendered ' + inputPath + ' -> ' + outputPath + ' (' + options.mode + ')')
  } catch (error) {
    console.error('CLI error:', error.message)
    console.error('Use --help for usage.')
    process.exit(1)
  }
}

main()
