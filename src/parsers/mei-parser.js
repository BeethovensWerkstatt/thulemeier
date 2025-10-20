// Conditional DOM API setup
let DOMParser

async function initializeDOMAPIs () {
  if (typeof window !== 'undefined') {
    // Browser environment
    DOMParser = window.DOMParser
  } else {
    // Node.js environment - dynamically import jsdom
    try {
      const { JSDOM } = await import('jsdom')
      const dom = new JSDOM()
      DOMParser = dom.window.DOMParser
    } catch (error) {
      throw new Error('jsdom is required for Node.js support. Install it with: npm install jsdom')
    }
  }
}

// Initialize DOM APIs once
const domAPIsReady = initializeDOMAPIs()

export class MEIParser {
  /**
   * Parse MEI input to DOM Document
   * @param {Document|string} input - MEI document as DOM or XML string
   * @returns {Promise<Document>} Parsed DOM document
   */
  async parse (input) {
    // Ensure DOM APIs are ready
    await domAPIsReady

    if (typeof input === 'string') {
      return this.parseXMLString(input)
    } else if (
      input &&
      typeof input.querySelector === 'function' &&
      input.nodeType === 9 // DOCUMENT_NODE
    ) {
      return input
    } else {
      throw new Error('Input must be an XML string or DOM Document')
    }
  }

  /**
   * Parse XML string to DOM Document
   * @param {string} xmlString - XML string to parse
   * @returns {Document} Parsed DOM document
   */
  parseXMLString (xmlString) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlString, 'application/xml')

      // Check for parsing errors
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        throw new Error(`XML parsing error: ${parseError.textContent}`)
      }

      return doc
    } catch (error) {
      throw new Error(`Failed to parse XML: ${error.message}`)
    }
  }

  /**
   * Extract pages from MEI document
   * @param {Document} meiDocument - MEI document
   * @returns {Array} Array of page objects
   */
  extractPages (meiDocument) {
    const surfaces = meiDocument.querySelectorAll('surface')
    return Array.from(surfaces).map((surface, index) => ({
      id: surface.getAttribute('xml:id'),
      index,
      element: surface,
      zones: Array.from(surface.querySelectorAll('zone'))
    }))
  }

  /**
   * Extract surfaces from MEI document
   * @param {Document} meiDocument - MEI document
   * @returns {Array} Array of surface objects
   */
  extractSurfaces (meiDocument) {
    const surfaces = meiDocument.querySelectorAll('surface')
    return Array.from(surfaces).map(surface => ({
      id: surface.getAttribute('xml:id'),
      element: surface,
      width: parseFloat(surface.getAttribute('width')) || 0,
      height: parseFloat(surface.getAttribute('height')) || 0
    }))
  }

  /**
   * Extract zones from MEI document
   * @param {Document} meiDocument - MEI document
   * @returns {Array} Array of zone objects
   */
  extractZones (meiDocument) {
    const zones = meiDocument.querySelectorAll('zone')
    return Array.from(zones).map(zone => ({
      id: zone.getAttribute('xml:id'),
      element: zone,
      ulx: parseFloat(zone.getAttribute('ulx')) || 0,
      uly: parseFloat(zone.getAttribute('uly')) || 0,
      lrx: parseFloat(zone.getAttribute('lrx')) || 0,
      lry: parseFloat(zone.getAttribute('lry')) || 0
    }))
  }

  /**
   * Extract rastrums from MEI document
   * @param {Document} meiDocument - MEI document
   * @returns {Array} Array of rastrum objects
   */
  extractRastrums (meiDocument) {
    const rastrums = meiDocument.querySelectorAll('rastrum')
    return Array.from(rastrums).map(rastrum => {
      const mmX = parseFloat(rastrum.getAttribute('system.leftmar')) || 0
      const mmY = parseFloat(rastrum.getAttribute('system.topmar')) || 0
      const mmW = parseFloat(rastrum.getAttribute('width')) || 0
      const mmH = parseFloat(rastrum.getAttribute('system.height')) || 0
      const rotate = parseFloat(rastrum.getAttribute('rotate')) || 0

      const baseScaling = 90 // TODO: get from context options
      const svgX = Math.round(mmX * baseScaling * 100) / 100
      const svgY = Math.round(mmY * baseScaling * 100) / 100
      const svgW = Math.round(mmW * baseScaling * 100) / 100
      const svgH = Math.round(mmH * baseScaling * 100) / 100

      const vuStepSize = (svgH - 10) / 8
      const loc0Y = svgY + svgH - 5

      return {
        id: rastrum.getAttribute('xml:id'),
        element: rastrum,
        x: mmX,
        y: mmY,
        w: mmW,
        h: mmH,
        svgX,
        svgY,
        svgW,
        svgH,
        vuStepSize,
        loc0Y,
        rotate
      }
    })
  }

  /**
   * Extract writing zones from MEI document
   * @param {Document} meiDocument - MEI document
   * @returns {Array} Array of writing zone objects
   */
  extractDrafts (meiDocument) {
    const wzs = meiDocument.querySelectorAll('genDesc[class="#geneticOrder_writingZoneLevel"]')
    const drafts = [...meiDocument.querySelectorAll('draft')]
    const sources = [...meiDocument.querySelectorAll('source')]
    return Array.from(wzs).map(wz => {
      const id = wz.getAttribute('xml:id')
      const label = wz.getAttribute('label') || ''
      const sourceId = sources.find(s => s.getAttribute('target').endsWith('#' + id)).getAttribute('xml:id') || null
      const draft = drafts.find(d => d.getAttribute('decls') === '#' + sourceId)
      const deletions = this.extractDeletions(draft)

      return {
        label,
        genDescId: id,
        draftId: draft.getAttribute('xml:id'),
        genDesc: wz,
        draft: {
          systems: this.extractSystems(draft),
          deletions,
          element: draft
        }
      }
    })
  }

  /**
   * Extract systems from a draft element
   * @param {Element} draft - Draft element
   * @returns {Array} Array of system objects
   */
  extractSystems (draft) {
    const systems = draft.querySelectorAll('system')
    return Array.from(systems).map(system => {
      const id = system.getAttribute('xml:id')
      const staves = this.extractEvents(system)
      const controlEvents = this.extractControlEvents(system)

      return {
        id,
        staves,
        system,
        controlEvents
      }
    })
  }

  /**
   * Extract events from a system element
   * @param {Element} system - System element
   * @returns {Array} Array of staff objects, containing an array of event objects
   */
  extractEvents (system) {
    const staves = []
    system.querySelectorAll('staffDef').forEach(staffDef => {
      const n = staffDef.getAttribute('n')
      const rastrum = staffDef.getAttribute('decls').split('#')[1]
      const notes = [...system.querySelectorAll('staff[n="' + n + '"] layer > note')].map(note => ({
        id: note.getAttribute('xml:id'),
        x: Math.round(parseFloat(note.getAttribute('x')) * 100) / 100,
        loc: parseInt(note.getAttribute('loc')),
        stemLen: note.hasAttribute('stem.dir') ? parseInt(note.getAttribute('stem.len')) || 7 : null,
        stemDir: note.getAttribute('stem.dir') || null,
        headShape: note.getAttribute('head.shape') || 'quarter',
        flags: parseInt(note.getAttribute('bw:stem.flags')) || null,
        facs: note.getAttribute('facs'),
        element: note
      }))
      const chords = [...system.querySelectorAll('staff[n="' + n + '"] layer > chord')].map(chord => ({
        id: chord.getAttribute('xml:id'),
        x: chord.getAttribute('x'),
        stemDir: chord.getAttribute('stem.dir') || null,
        stemLen: chord.hasAttribute('stem.dir') ? parseInt(chord.getAttribute('stem.len')) || 7 : null,
        flags: parseInt(chord.getAttribute('dur')) > 4 ? (Math.log2(parseInt(chord.getAttribute('dur')) / 8) + 1) : null, // parseInt(chord.getAttribute('bw:flags')) || null,
        notes: [...chord.querySelectorAll('note')].map(note => ({
          id: note.getAttribute('xml:id'),
          loc: parseInt(note.getAttribute('loc')),
          headShape: note.getAttribute('head.shape') || 'quarter'
        })),
        facs: chord.getAttribute('facs'),
        element: chord
      }))
      const rests = [...system.querySelectorAll('staff[n="' + n + '"] layer > rest')].map(rest => ({
        id: rest.getAttribute('xml:id'),
        x: Math.round(parseFloat(rest.getAttribute('x')) * 100) / 100,
        loc: parseInt(rest.getAttribute('loc')),
        facs: rest.getAttribute('facs'),
        type: rest.getAttribute('glyph.name'),
        element: rest
      }))
      const accids = [...system.querySelectorAll('staff[n="' + n + '"] layer > accid')].map(accid => ({
        id: accid.getAttribute('xml:id'),
        x: Math.round(parseFloat(accid.getAttribute('x')) * 100) / 100,
        loc: parseInt(accid.getAttribute('loc')),
        facs: accid.getAttribute('facs'),
        accid: accid.getAttribute('accid'),
        element: accid
      }))
      const clefs = [...system.querySelectorAll('staff[n="' + n + '"] layer > clef')].map(clef => ({
        id: clef.getAttribute('xml:id'),
        x: clef.getAttribute('x'),
        shape: clef.getAttribute('shape'),
        line: clef.getAttribute('line'),
        element: clef
      }))
      const dots = [...system.querySelectorAll('staff[n="' + n + '"] layer > dot')].map(dot => ({
        id: dot.getAttribute('xml:id'),
        x: Math.round(parseFloat(dot.getAttribute('x')) * 100) / 100,
        loc: parseInt(dot.getAttribute('loc')),
        facs: dot.getAttribute('facs'),
        element: dot
      }))
      const meterSigs = [...system.querySelectorAll('staff[n="' + n + '"] layer > meterSig')].map(meterSig => ({
        id: meterSig.getAttribute('xml:id'),
        x: Math.round(parseFloat(meterSig.getAttribute('x')) * 100) / 100,
        loc: parseInt(meterSig.getAttribute('loc')),
        facs: meterSig.getAttribute('facs'),
        symbol: meterSig.hasAttribute('sym') ? meterSig.getAttribute('sym') : null,
        count: meterSig.hasAttribute('sym') ? null : meterSig.getAttribute('count'),
        unit: meterSig.hasAttribute('sym') ? null : meterSig.getAttribute('unit'),
        element: meterSig
      }))
      const artics = [...system.querySelectorAll('artic')].map(artic => {
        return {
          id: artic.getAttribute('xml:id'),
          x: Math.round(parseFloat(artic.getAttribute('x')) * 100) / 100,
          y: Math.round(parseFloat(artic.getAttribute('y')) * 100) / 100,
          artic: artic.getAttribute('artic'),
          facs: artic.getAttribute('facs'),
          element: artic
        }
      })

      staves.push({ n, rastrum, notes, chords, rests, accids, clefs, dots, meterSigs, artics })
    })
    return staves
  }

  /**
   * Extract control events from a system element
   * @param {Element} system - System element
   * @returns {Array} Array of control event objects
   */
  extractControlEvents (system) {
    const rastrums = []
    system.querySelectorAll('staffDef').forEach(staffDef => {
      rastrums.push(staffDef.getAttribute('decls').split('#')[1])
    })

    const barLines = [...system.querySelectorAll('barLine')].map(barLine => ({
      id: barLine.getAttribute('xml:id'),
      x: Math.round(parseFloat(barLine.getAttribute('x')) * 100) / 100,
      y: Math.round(parseFloat(barLine.getAttribute('y')) * 100) / 100,
      x2: Math.round(parseFloat(barLine.getAttribute('x2')) * 100) / 100,
      y2: Math.round(parseFloat(barLine.getAttribute('y2')) * 100) / 100,
      facs: barLine.getAttribute('facs'),
      rastrum: rastrums[0],
      element: barLine
    }))

    const beams = [...system.querySelectorAll('line[func="beam"]')].map(beam => ({
      id: beam.getAttribute('xml:id'),
      x: Math.round(parseFloat(beam.getAttribute('x')) * 100) / 100,
      y: Math.round(parseFloat(beam.getAttribute('y')) * 100) / 100,
      x2: Math.round(parseFloat(beam.getAttribute('x2')) * 100) / 100,
      y2: Math.round(parseFloat(beam.getAttribute('y2')) * 100) / 100,
      facs: beam.getAttribute('facs'),
      rastrum: rastrums[parseInt(beam.getAttribute('staff')) - 1],
      element: beam
    }))

    const dirs = [...system.querySelectorAll('dir')].map(dir => {
      const staff = dir.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      // Extract mixed content as array of segments split at <lb>
      function extractSegments (node) {
        const segments = []
        let seg = ''

        function traverse (n) {
          if (n.nodeType === 3) {
            // Text node - add to current segment
            seg += n.nodeValue.replace(/\n/g, ' ').replace(/\s+/g, ' ')
          } else if (n.nodeType === 1) {
            // Element node
            if (n.localName === 'lb') {
              // Line break - push current segment and reset
              if (seg.trim()) {
                segments.push(seg.trim())
              }
              seg = ''
            } else {
              // Other element - traverse its children
              if (n.childNodes && n.childNodes.length) {
                for (let i = 0; i < n.childNodes.length; i++) {
                  traverse(n.childNodes[i])
                }
              }
            }
          }
        }

        traverse(node)

        // Push the final segment if it has content
        if (seg.trim()) {
          segments.push(seg.trim())
        }

        // Filter out empty segments
        return segments.filter(s => s.length > 0)
      }
      return {
        id: dir.getAttribute('xml:id'),
        x: Math.round(parseFloat(dir.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(dir.getAttribute('y')) * 100) / 100,
        width: Math.round(parseFloat(dir.getAttribute('width')) * 100) / 100,
        content: extractSegments(dir), // array of segments split at <lb>
        facs: dir.getAttribute('facs'),
        lineheight: parseFloat(dir.getAttribute('lineheight')) || null,
        rotation: parseFloat(dir.getAttribute('rotation')) || null,
        rastrum,
        element: dir
      }
    })

    const tempos = [...system.querySelectorAll('tempo')].map(tempo => {
      const staff = tempo.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: tempo.getAttribute('xml:id'),
        x: Math.round(parseFloat(tempo.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(tempo.getAttribute('y')) * 100) / 100,
        width: Math.round(parseFloat(tempo.getAttribute('width')) * 100) / 100,
        content: tempo.textContent.trim() || '', // we need to be able to get mixed content
        facs: tempo.getAttribute('facs'),
        rastrum,
        element: tempo
      }
    })

    const hairpins = [...system.querySelectorAll('hairpin')].map(hairpin => {
      const staff = hairpin.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: hairpin.getAttribute('xml:id'),
        x: Math.round(parseFloat(hairpin.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(hairpin.getAttribute('y')) * 100) / 100,
        x2: Math.round(parseFloat(hairpin.getAttribute('x2')) * 100) / 100,
        y2: Math.round(parseFloat(hairpin.getAttribute('y2')) * 100) / 100,
        opening: Math.round(parseFloat(hairpin.getAttribute('opening')) * 100) / 100,
        startOpening: Math.round(parseFloat(hairpin.getAttribute('bw:start.opening')) * 100) / 100,
        form: hairpin.getAttribute('form'),
        facs: hairpin.getAttribute('facs'),
        rastrum,
        element: hairpin
      }
    })

    const trills = [...system.querySelectorAll('trill')].map(trill => {
      const staff = trill.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: trill.getAttribute('xml:id'),
        x: Math.round(parseFloat(trill.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(trill.getAttribute('y')) * 100) / 100,
        facs: trill.getAttribute('facs'),
        rastrum,
        element: trill
      }
    })

    const octaves = [...system.querySelectorAll('octave')].map(octave => {
      const staff = octave.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: octave.getAttribute('xml:id'),
        x: Math.round(parseFloat(octave.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(octave.getAttribute('y')) * 100) / 100,
        width: Math.round(parseFloat(octave.getAttribute('width')) * 100) / 100,
        dis: octave.getAttribute('dis'),
        disPlace: octave.getAttribute('dis.place'),
        facs: octave.getAttribute('facs'),
        rastrum,
        element: octave
      }
    })

    const fermatas = [...system.querySelectorAll('fermata')].map(fermata => {
      const staff = fermata.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: fermata.getAttribute('xml:id'),
        x: Math.round(parseFloat(fermata.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(fermata.getAttribute('y')) * 100) / 100,
        form: fermata.getAttribute('form'),
        facs: fermata.getAttribute('facs'),
        rastrum,
        element: fermata
      }
    })

    const pedals = [...system.querySelectorAll('pedal')].map(pedal => {
      const staff = pedal.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: pedal.getAttribute('xml:id'),
        x: Math.round(parseFloat(pedal.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(pedal.getAttribute('y')) * 100) / 100,
        dir: pedal.getAttribute('dir'),
        facs: pedal.getAttribute('facs'),
        rastrum,
        element: pedal
      }
    })

    const words = [...system.querySelectorAll('word')].map(word => {
      const staff = word.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: word.getAttribute('xml:id'),
        x: Math.round(parseFloat(word.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(word.getAttribute('y')) * 100) / 100,
        width: Math.round(parseFloat(word.getAttribute('width')) * 100) / 100,
        content: word.textContent.trim() || '', // we need to be able to get mixed content
        facs: word.getAttribute('facs'),
        rastrum,
        element: word
      }
    })

    const fings = [...system.querySelectorAll('fing')].map(fing => {
      const staff = fing.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: fing.getAttribute('xml:id'),
        x: Math.round(parseFloat(fing.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(fing.getAttribute('y')) * 100) / 100,
        content: fing.textContent.trim() || '', // we need to be able to get mixed content
        facs: fing.getAttribute('facs'),
        rastrum,
        element: fing
      }
    })

    const fs = [...system.querySelectorAll('f')].map(f => {
      const staff = f.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: f.getAttribute('xml:id'),
        x: Math.round(parseFloat(f.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(f.getAttribute('y')) * 100) / 100,
        content: f.textContent.trim() || '', // we need to be able to get mixed content
        facs: f.getAttribute('facs'),
        rastrum,
        element: f
      }
    })

    const metaMarkClarifications = [...system.querySelectorAll('metaMark[function="clarification"]')].map(metaMark => {
      const staff = metaMark.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: metaMark.getAttribute('xml:id'),
        x: Math.round(parseFloat(metaMark.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(metaMark.getAttribute('y')) * 100) / 100,
        // width: Math.round(parseFloat(metaMark.getAttribute('width')) * 100) / 100,
        function: metaMark.getAttribute('function'),
        content: metaMark.textContent.trim() || '', // we need to be able to get mixed content
        facs: metaMark.getAttribute('facs'),
        rastrum,
        element: metaMark
      }
    })

    const metaMarkNavigations = [...system.querySelectorAll('metaMark[function="navigation"]')].map(metaMark => {
      // const staff = metaMark.getAttribute('staff')
      // const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: metaMark.getAttribute('xml:id'),
        x: Math.round(parseFloat(metaMark.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(metaMark.getAttribute('y')) * 100) / 100,
        // width: Math.round(parseFloat(metaMark.getAttribute('width')) * 100) / 100,
        function: metaMark.getAttribute('function'),
        target: metaMark.hasAttribute('target') ? metaMark.getAttribute('target') : null,
        content: metaMark.textContent.trim() || '', // we need to be able to get mixed content
        facs: metaMark.getAttribute('facs'),
        rastrum: rastrums[0],
        element: metaMark
      }
    })

    const dynams = [...system.querySelectorAll('dynam')].map(dynam => {
      const staff = dynam.getAttribute('staff')
      const rastrum = rastrums[parseInt(staff) - 1]
      return {
        id: dynam.getAttribute('xml:id'),
        x: Math.round(parseFloat(dynam.getAttribute('x')) * 100) / 100,
        y: Math.round(parseFloat(dynam.getAttribute('y')) * 100) / 100,
        width: Math.round(parseFloat(dynam.getAttribute('width')) * 100) / 100,
        content: dynam.textContent.trim() || '', // we need to be able to get mixed content
        facs: dynam.getAttribute('facs'),
        rastrum,
        element: dynam
      }
    })

    const curves = [...system.querySelectorAll('curve')].map(curve => {
      const rastrum = rastrums[0]
      return {
        id: curve.getAttribute('xml:id'),
        rastrum,
        bezier: curve.getAttribute('bezier') || null,
        facs: curve.getAttribute('facs'),
        element: curve
      }
    })

    // pedal

    return { barLines, beams, dirs, tempos, dynams, curves, hairpins, trills, octaves, fermatas, pedals, words, fings, fs, metaMarkClarifications, metaMarkNavigations }
  }

  /**
   * Extract deletions from a draft element
   * @param {Element} draft - Draft element
   * @returns {Array} Array of deletion objects
   */
  extractDeletions (draft) {
    const deletions = []
    const dels = draft.querySelectorAll('del')
    dels.forEach(del => {
      deletions.push({
        id: del.getAttribute('xml:id'),
        path: del.querySelector('path').getAttribute('d'),
        element: del
      })
    })
    return deletions
  }
}
