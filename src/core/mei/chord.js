const chordWidth = 480
const chordHeight = 480
const ledgerLineLength = 228
const ledgerLineOffset = 39
const ledgerLineWidth = 18
const stemWidth = 14

/**
 * Renders a single chord into the given staff group
 * @param {Object} chord - the chord object parsed from MEI in mei-parser.js
 * @param {SVGElement} staffG - the staff group element to render the chord into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderChord (chord, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const defs = svg.querySelector('defs')

  // Chord noteheads: array of {loc, headShape, staff, rastrum}
  const notes = chord.notes || []
  const notesByStaff = new Map()
  notes.forEach(note => {
    const noteStaff = note.staff || chord.staff
    if (!notesByStaff.has(noteStaff)) {
      notesByStaff.set(noteStaff, [])
    }
    notesByStaff.get(noteStaff).push(note)
  })
  notesByStaff.forEach(staffNotes => staffNotes.sort((a, b) => a.loc - b.loc))

  const getNoteRastrum = note => {
    const noteRastrum = context.rastrums.find(candidate => candidate.id === note.rastrum)
    return noteRastrum || rastrum
  }

  const toChordStaffCoordinates = (sourceRastrum, x, y) => {
    if (sourceRastrum === rastrum) {
      return { x, y }
    }
    const sourceRadians = sourceRastrum.rotate * Math.PI / 180
    const chordRadians = rastrum.rotate * Math.PI / 180
    const sourceCos = Math.cos(sourceRadians)
    const sourceSin = Math.sin(sourceRadians)
    const chordCos = Math.cos(chordRadians)
    const chordSin = Math.sin(chordRadians)
    const globalX = sourceRastrum.svgX + sourceCos * (x - sourceRastrum.svgX) - sourceSin * (y - sourceRastrum.svgY)
    const globalY = sourceRastrum.svgY + sourceSin * (x - sourceRastrum.svgX) + sourceCos * (y - sourceRastrum.svgY)
    const offsetX = globalX - rastrum.svgX
    const offsetY = globalY - rastrum.svgY
    return {
      x: rastrum.svgX + chordCos * offsetX + chordSin * offsetY,
      y: rastrum.svgY - chordSin * offsetX + chordCos * offsetY
    }
  }

  const getCrossStaffPosition = (sourceRastrum, x, y) => {
    if (sourceRastrum === rastrum) {
      return { x, y, sourceX: x }
    }
    const sourceOrigin = toChordStaffCoordinates(sourceRastrum, 0, 0)
    const rotationDifference = (sourceRastrum.rotate - rastrum.rotate) * Math.PI / 180
    const sourceX = (x - sourceOrigin.x + Math.sin(rotationDifference) * y) / Math.cos(rotationDifference)
    const position = toChordStaffCoordinates(sourceRastrum, sourceX, y)
    return { x, y: position.y, sourceX }
  }

  // Placement logic: per-note side decision
  // For stemDir up: start with lowest loc, for down: start with highest loc
  // left for up, right for down
  const sideDecisions = new Map()
  notesByStaff.forEach(staffNotes => {
    const orderedNotes = [...staffNotes]
    if (chord.stemDir === 'down') {
      orderedNotes.reverse()
    }
    let lastSide = 'default'
    orderedNotes.forEach((note, index) => {
      const previousNote = orderedNotes[index - 1]
      const side = index > 0 && Math.abs(note.loc - previousNote.loc) === 1 && lastSide === 'default' ? 'other' : 'default'
      sideDecisions.set(note, side)
      lastSide = side
    })
  })

  const sortedNotes = [...notes].sort((a, b) => {
    const aStaff = a.staff || chord.staff
    const bStaff = b.staff || chord.staff
    if (aStaff !== bStaff) {
      if (aStaff === chord.staff) return -1
      if (bStaff === chord.staff) return 1
      return aStaff.localeCompare(bStaff, undefined, { numeric: true })
    }
    return chord.stemDir === 'down' ? b.loc - a.loc : a.loc - b.loc
  })

  // Create the chord group
  const chordG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  chordG.setAttribute('class', 'chord' + (chord.unclear ? ' unclear' : ''))
  chordG.setAttribute('data-id', chord.id)
  if (chord.stemDir) chordG.setAttribute('data-stem.dir', chord.stemDir)

  const notePositions = new Map()

  // Render noteheads with per-note side decision
  sortedNotes.forEach(note => {
    const noteHead = note.headShape || 'quarter'
    const symbolId = 'sym_notehead_' + noteHead
    const symbolAvailable = defs.querySelector('#' + symbolId)
    if (!symbolAvailable) {
      // ...create symbol as in note.js...
      const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
      symbol.setAttribute('id', symbolId)
      symbol.setAttribute('viewBox', '0 0 1000 1000')
      symbol.setAttribute('overflow', 'inherit')
      const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('transform', 'scale(1,-1)')
      let d
      switch (noteHead) {
        case 'half':
          d = 'M278 64c0 22 -17 39 -43 39c-12 0 -26 -3 -41 -10c-85 -43 -165 -94 -165 -156c5 -25 15 -32 49 -32c67 11 200 95 200 159zM0 -36c0 68 73 174 200 174c66 0 114 -39 114 -97c0 -84 -106 -173 -218 -173c-64 0 -96 32 -96 96z'
          break
        case 'whole':
          d = 'M198 133c102 0 207 -45 207 -133c0 -92 -118 -133 -227 -133c-101 0 -178 46 -178 133c0 88 93 133 198 133zM293 -21c0 14 -3 29 -8 44c-7 20 -18 38 -33 54c-20 21 -43 31 -68 31l-20 -2c-15 -5 -27 -14 -36 -28c-4 -9 -6 -17 -8 -24s-3 -16 -3 -27c0 -15 3 -34 9 -57 s18 -41 34 -55c15 -15 36 -23 62 -23c4 0 10 1 18 2c19 5 32 15 40 30s13 34 13 55z'
          break
        case 'quarter':
        default:
          d = 'M0 -39c0 68 73 172 200 172c66 0 114 -37 114 -95c0 -84 -106 -171 -218 -171c-64 0 -96 30 -96 94z'
          break
      }
      path.setAttribute('d', d)
      symbol.appendChild(path)
      defs.appendChild(symbol)
    }
    const headG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    headG.setAttribute('class', 'notehead')
    chordG.appendChild(headG)
    const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symbolId}`)
    use.setAttribute('height', chordHeight + 'px')
    use.setAttribute('width', chordWidth + 'px')
    // Placement: stemDir up = left, down = right, alternate if needed
    const noteRastrum = getNoteRastrum(note)
    const xBase = rastrumX + (chord.x * context.options.baseScaling || 0)
    const xOff = ledgerLineLength - 2 * ledgerLineOffset
    const y = noteRastrum.loc0Y - (note.loc * noteRastrum.vuStepSize)
    let x
    const side = sideDecisions.get(note)
    if (chord.stemDir === 'up') {
      x = xBase + (side === 'default' ? 0 : xOff)
    } else if (chord.stemDir === 'down') {
      x = xBase - (side === 'default' ? 0 : xOff)
    } else {
      x = xBase
    }
    const position = getCrossStaffPosition(noteRastrum, x, y)
    notePositions.set(note, position)
    use.setAttribute('x', position.x)
    use.setAttribute('y', position.y)
    headG.appendChild(use)
  })

  // Ledger lines are staff-specific for cross-staff chords.
  notesByStaff.forEach(staffNotes => {
    const staffRastrum = getNoteRastrum(staffNotes[0])
    const crossStaff = staffRastrum !== rastrum
    // Below: for lowest loc
    const minLoc = Math.min(...staffNotes.map(note => note.loc))
    if (minLoc < 0) {
      const ledgerG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      ledgerG.setAttribute('class', 'ledgerLines below')
      chordG.appendChild(ledgerG)

      const xBase = rastrumX + (chord.x * context.options.baseScaling || 0)
      // const xOff = ledgerLineLength - 2 * ledgerLineOffset

      const x1 = Math.round((xBase - ledgerLineOffset) * 100) / 100
      const x2 = Math.round((x1 + ledgerLineLength) * 100) / 100

      for (let line = minLoc; line < 0; line++) {
        if (line % 2 !== 0) continue
        const i = line - minLoc
        const lineY = Math.round((staffRastrum.loc0Y - (minLoc * staffRastrum.vuStepSize) - (i * staffRastrum.vuStepSize)) * 100) / 100
        const start = crossStaff ? getCrossStaffPosition(staffRastrum, x1, lineY) : { x: x1, y: lineY }
        const end = crossStaff ? getCrossStaffPosition(staffRastrum, x2, lineY) : { x: x2, y: lineY }
        const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', `M${start.x} ${start.y} L${end.x} ${end.y}`)
        path.setAttribute('stroke-width', ledgerLineWidth)
        // path.setAttribute('stroke', 'black')
        ledgerG.appendChild(path)
      }
    }
    // Above: for highest loc
    const maxLoc = Math.max(...staffNotes.map(note => note.loc))
    if (maxLoc > 8) {
      const ledgerG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      ledgerG.setAttribute('class', 'ledgerLines above')
      chordG.appendChild(ledgerG)

      const xBase = rastrumX + (chord.x * context.options.baseScaling || 0)
      // const xOff = ledgerLineLength - 2 * ledgerLineOffset

      const x1 = Math.round((xBase - ledgerLineOffset) * 100) / 100
      const x2 = Math.round((x1 + ledgerLineLength) * 100) / 100

      for (let line = 9; line <= maxLoc; line++) {
        if (line % 2 !== 0) continue
        const i = line - maxLoc
        const lineY = Math.round((staffRastrum.loc0Y - (maxLoc * staffRastrum.vuStepSize) - (i * staffRastrum.vuStepSize)) * 100) / 100
        const start = crossStaff ? getCrossStaffPosition(staffRastrum, x1, lineY) : { x: x1, y: lineY }
        const end = crossStaff ? getCrossStaffPosition(staffRastrum, x2, lineY) : { x: x2, y: lineY }
        const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', `M${start.x} ${start.y} L${end.x} ${end.y}`)
        path.setAttribute('stroke-width', ledgerLineWidth)
        // path.setAttribute('stroke', 'black')
        ledgerG.appendChild(path)
      }
    }
  })

  // Render stem if needed (same as note.js + avoid whole note stems ; o we need longa etc.?)
  const headShapes = [...new Set(notes.map(note => note.headShape || 'quarter'))]
  if (notes.length > 0 && chord.stemDir && !chord.stemHidden && !headShapes.includes('whole')) {
    const stemG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    stemG.setAttribute('class', 'stem')
    chordG.appendChild(stemG)
    const stemLen = chord.stemLen || 5
    let stemX, stemY1, stemY2
    const noteYs = notes.map(note => notePositions.get(note).y)
    const topY = Math.min(...noteYs)
    const bottomY = Math.max(...noteYs)
    const mainX = rastrumX + (chord.x * context.options.baseScaling || 0)
    if (chord.stemDir === 'up') {
      stemX = mainX + (ledgerLineLength - 2 * ledgerLineOffset)
      stemY1 = topY - (stemLen + 1) * vuStepSize
      stemY2 = bottomY
    } else {
      stemX = mainX
      stemY1 = topY
      stemY2 = bottomY + (stemLen + 1) * vuStepSize
    }
    const stemPath = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    stemPath.setAttribute('d', `M${stemX} ${stemY1} L${stemX} ${stemY2}`)
    stemPath.setAttribute('stroke-width', stemWidth)
    // stemPath.setAttribute('stroke', 'black')
    stemG.appendChild(stemPath)

    if (chord.flags) {
      // console.log(4567, 'Chord:', chord)
    }
    // flags (same as note.js, using refactored logic)
    if (chord.stemDir && chord.flags && chord.flags > 0) {
      const flagG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      flagG.setAttribute('class', `flag ${chord.stemDir}`)
      stemG.appendChild(flagG)
      const flagData = {
        up: {
          1: { name: 'sym_flag_eighth_up', path: 'M179 -646c15 29 29 55 46 102c18 49 30 108 30 138c0 105 -80 173 -168 200c-18 5 -47 9 -87 16v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -38 -13 -106 -35 -163c-20 -51 -43 -99 -66 -132c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 14 25 18 33z' },
          2: { name: 'sym_flag_16th_up', path: 'M206 -748c32 48 49 100 49 149c0 89 -55 168 -168 203c-18 5 -47 9 -87 16v190v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -32 -7 -65 -17 -96c11 -29 17 -60 17 -94c0 -71 -32 -148 -67 -190c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 6 8 11 16zM248 -463c4 18 7 38 7 57c0 105 -80 173 -168 200c-11 3 -27 6 -47 9c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c36 -33 71 -74 94 -122z' },
          3: { name: 'sym_flag_32nd_up', path: 'M248 -463c4 18 7 38 7 57c0 105 -80 173 -168 200c-11 3 -27 6 -47 9c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c36 -33 71 -74 94 -122zM206 -748c32 48 49 100 49 149c0 89 -55 168 -168 203c-18 5 -47 9 -87 16v190v190v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56 c61 -57 122 -134 122 -235v-6c-1 -59 -10 -80 -19 -91c12 -30 19 -63 19 -99c0 -32 -7 -65 -17 -96c11 -29 17 -60 17 -94c0 -71 -32 -148 -67 -190c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10c1 3 6 8 11 16zM247 -270c4 11 8 28 8 54c0 105 -80 173 -168 200c-11 3 -27 6 -47 9 c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c35 -33 70 -72 93 -119z' }
        },
        down: {
          1: { name: 'sym_flag_eighth_down', path: 'M179 646c-4 8 -17 30 -18 33l-4 10c0 3 2 5 5 5s7 -2 13 -7c23 -33 46 -81 66 -132c22 -57 35 -125 35 -163c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190c40 7 69 11 87 16c88 27 168 95 168 200c0 30 -12 89 -30 138 c-17 47 -31 73 -46 102z' },
          2: { name: 'sym_flag_16th_down', path: 'M216 730c-5 8 -10 13 -11 16l-4 10c0 3 2 5 5 5s7 -2 13 -7c35 -42 57 -101 57 -172c0 -34 -6 -65 -17 -94c10 -31 17 -64 17 -96c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190v190c40 7 69 11 87 16c116 36 175 111 175 197 c0 44 -15 91 -46 137zM248 463c-23 -48 -58 -89 -94 -122c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 19 -3 39 -7 57z' },
          3: { name: 'sym_flag_32nd_down', path: 'M248 463c-23 -48 -58 -89 -94 -122c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 19 -3 39 -7 57zM215 729c-5 8 -10 13 -11 16l-4 10c0 3 2 5 5 5s7 -2 13 -7c35 -42 58 -100 58 -171c0 -34 -6 -65 -17 -94 c10 -31 17 -64 17 -96c0 -36 -7 -69 -19 -99c9 -11 18 -32 19 -91v-6c0 -101 -61 -178 -122 -235c-63 -59 -57 -53 -61 -56c-38 -34 -51 -95 -59 -95h-34v190v190v190c40 7 69 11 87 16c116 36 174 110 174 196c0 44 -15 91 -46 137zM247 270c-23 -47 -58 -86 -93 -119 c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 26 -4 43 -8 54z' }
        }
      }
      const flagInfo = flagData[chord.stemDir][chord.flags]
      if (flagInfo) {
        const flagName = flagInfo.name
        const flagAvailable = defs.querySelector('#' + flagName)
        if (!flagAvailable) {
          // console.warn(`Flag symbol ${flagName} not found in SVG defs`)
          const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
          symbol.setAttribute('id', flagName)
          symbol.setAttribute('viewBox', '0 0 1000 1000')
          symbol.setAttribute('overflow', 'inherit')
          const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
          path.setAttribute('transform', 'scale(1,-1)')
          path.setAttribute('d', flagInfo.path)
          symbol.appendChild(path)
          defs.appendChild(symbol)
        }
        const flagUse = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
        flagUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${flagName}`)
        flagUse.setAttribute('height', chordHeight + 'px')
        flagUse.setAttribute('width', chordWidth + 'px')
        const flagX = stemX - stemWidth / 2
        const flagY = chord.stemDir === 'up' ? stemY1 : stemY2
        flagUse.setAttribute('x', flagX)
        flagUse.setAttribute('y', flagY)
        flagG.appendChild(flagUse)
      }
    }
  }

  staffG.appendChild(chordG)
}
