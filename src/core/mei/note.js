const noteWidth = 480
const noteHeight = 480
const ledgerLineLength = 228
const ledgerLineOffset = 39
const ledgerLineWidth = 18
const stemWidth = 14

/**
 * Renders a single note into the given staff group
 * @param {Object} note - the note object parsed from MEI in mei-parser.js
 * @param {SVGElement} staffG - the staff group element to render the note into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderNote (note, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const noteHead = note.headShape || 'quarter'
  const symbolId = 'sym_notehead_' + noteHead

  const defs = svg.querySelector('defs')
  const symbolAvailable = defs.querySelector('#' + symbolId)

  if (!symbolAvailable) {
    console.warn(`Notehead symbol ${symbolId} not found in SVG defs`)
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

  // Render the note
  /* <g data-id="d38a149cc-d66f-4568-ae60-168c49560e71" data-class="note" class="note selectedDiploTrans" data-stem.dir="up">
      <g data-id="bbox-d38a149cc-d66f-4568-ae60-168c49560e71" data-class="note" class="note bounding-box" data-stem.dir="up">
          <rect x="2367" y="3994" height="156" width="185" fill="transparent"></rect>
      </g>
      <g data-class="notehead" class="notehead">
          <use href="#E0A4-m8vtrn8" x="12960" y="4072" height="590px" width="590px">
            <symbol id="E0A4-m8vtrn8" viewBox="0 0 1000 1000" overflow="inherit">
              <path transform="scale(1,-1)" d="M0 -39c0 68 73 172 200 172c66 0 114 -37 114 -95c0 -84 -106 -171 -218 -171c-64 0 -96 30 -96 94z"></path>
            </symbol>

            <symbol id="E0A4-m8vtrn8" viewBox="0 0 1000 1000" overflow="inherit">
              <path transform="scale(1,-1)" d="M0 -39c0 68 73 172 200 172c66 0 114 -37 114 -95c0 -84 -106 -171 -218 -171c-64 0 -96 30 -96 94z"></path>
            </symbol>

          </use>
      </g>
      <g data-id="her9859" data-class="stem" class="stem">
          <g data-id="bbox-her9859" data-class="stem" class="stem bounding-box">
            <rect x="2367" y="3585" height="472" width="14" fill="transparent"></rect>
          </g>
          <path d="M13138 4050 L13138 3592" stroke-width="14"></path>
      </g>
    </g> */

  // Create the note group
  const noteG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  noteG.setAttribute('class', 'note')
  noteG.setAttribute('data-id', note.id)
  if (note.stemDir) noteG.setAttribute('data-stem.dir', note.stemDir)

  const headG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  headG.setAttribute('class', 'notehead')
  noteG.appendChild(headG)

  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symbolId}`)
  use.setAttribute('height', noteHeight + 'px')
  use.setAttribute('width', noteWidth + 'px')

  const x = rastrumX + (note.x * context.options.baseScaling || 0)
  const y = loc0Y - (note.loc * vuStepSize)

  use.setAttribute('x', x)
  use.setAttribute('y', y)
  headG.appendChild(use)

  // ledger lines
  // Below: every even value >= note.loc and < 0
  if (note.loc < 0) {
    const ledgerG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    ledgerG.setAttribute('class', 'ledgerLines below')
    noteG.appendChild(ledgerG)

    const x1 = Math.round((x - ledgerLineOffset) * 100) / 100
    const x2 = Math.round((x1 + ledgerLineLength) * 100) / 100

    for (let line = note.loc; line < 0; line++) {
      if (line % 2 !== 0) continue // only even lines
      const i = line - note.loc
      const lineY = Math.round((y - (i * vuStepSize)) * 100) / 100
      const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${x1} ${lineY} L${x2} ${lineY}`)
      path.setAttribute('stroke-width', ledgerLineWidth)
      // path.setAttribute('stroke', 'black')
      ledgerG.appendChild(path)
    }
  }
  // Above: every even value > 8 and <= note.loc
  if (note.loc > 8) {
    const ledgerG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    ledgerG.setAttribute('class', 'ledgerLines above')
    noteG.appendChild(ledgerG)

    const x1 = Math.round((x - ledgerLineOffset) * 100) / 100
    const x2 = Math.round((x1 + ledgerLineLength) * 100) / 100

    for (let line = 9; line <= note.loc; line++) {
      if (line % 2 !== 0) continue // only even lines
      const i = line - note.loc
      const lineY = Math.round((y - (i * vuStepSize)) * 100) / 100
      const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M${x1} ${lineY} L${x2} ${lineY}`)
      path.setAttribute('stroke-width', ledgerLineWidth)
      // path.setAttribute('stroke', 'black')
      ledgerG.appendChild(path)
    }
  }

  // Render stem if needed
  if (note.stemDir) {
    const stemG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    stemG.setAttribute('class', 'stem')
    noteG.appendChild(stemG)

    const stemHeight = (note.stemLen || 7) * vuStepSize
    let stemX, stemY1, stemY2
    if (note.stemDir === 'up') {
      stemX = x + (ledgerLineLength - 2 * ledgerLineOffset)
      stemY1 = y - stemHeight
      stemY2 = y
    } else {
      stemX = x
      stemY1 = y
      stemY2 = y + stemHeight
    }

    const stemPath = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    stemPath.setAttribute('d', `M${stemX} ${stemY1} L${stemX} ${stemY2}`)
    stemPath.setAttribute('stroke-width', stemWidth)
    // stemPath.setAttribute('stroke', 'black')
    stemG.appendChild(stemPath)

    // flags, if necessary
    if (note.stemDir && note.flags && note.flags > 0) {
      const flagG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      flagG.setAttribute('class', `flag ${note.stemDir}`)
      stemG.appendChild(flagG)

      // Map flags and stemDir to symbol name and path
      const flagData = {
        up: {
          1: {
            name: 'sym_flag_eighth_up',
            path: 'M179 -646c15 29 29 55 46 102c18 49 30 108 30 138c0 105 -80 173 -168 200c-18 5 -47 9 -87 16v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -38 -13 -106 -35 -163c-20 -51 -43 -99 -66 -132c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 14 25 18 33z'
          },
          2: {
            name: 'sym_flag_16th_up',
            path: 'M206 -748c32 48 49 100 49 149c0 89 -55 168 -168 203c-18 5 -47 9 -87 16v190v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56c62 -58 122 -137 122 -241c0 -32 -7 -65 -17 -96c11 -29 17 -60 17 -94c0 -71 -32 -148 -67 -190c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10 c1 3 6 8 11 16zM248 -463c4 18 7 38 7 57c0 105 -80 173 -168 200c-11 3 -27 6 -47 9c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c36 -33 71 -74 94 -122z'
          },
          3: {
            name: 'sym_flag_32nd_up',
            path: 'M248 -463c4 18 7 38 7 57c0 105 -80 173 -168 200c-11 3 -27 6 -47 9c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c36 -33 71 -74 94 -122zM206 -748c32 48 49 100 49 149c0 89 -55 168 -168 203c-18 5 -47 9 -87 16v190v190v190h22c8 0 33 -61 71 -95c4 -3 -2 3 61 -56 c61 -57 122 -134 122 -235v-6c-1 -59 -10 -80 -19 -91c12 -30 19 -63 19 -99c0 -32 -7 -65 -17 -96c11 -29 17 -60 17 -94c0 -71 -32 -148 -67 -190c-6 -5 -10 -7 -13 -7s-5 2 -5 5l4 10c1 3 6 8 11 16zM247 -270c4 11 8 28 8 54c0 105 -80 173 -168 200c-11 3 -27 6 -47 9 c9 -17 23 -61 53 -88c4 -3 -2 3 61 -56c35 -33 70 -72 93 -119z'
          }
        },
        down: {
          1: {
            name: 'sym_flag_eighth_down',
            path: 'M179 646c-4 8 -17 30 -18 33l-4 10c0 3 2 5 5 5s7 -2 13 -7c23 -33 46 -81 66 -132c22 -57 35 -125 35 -163c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190c40 7 69 11 87 16c88 27 168 95 168 200c0 30 -12 89 -30 138 c-17 47 -31 73 -46 102z'
          },
          2: {
            name: 'sym_flag_16th_down',
            path: 'M216 730c-5 8 -10 13 -11 16l-4 10c0 3 2 5 5 5s7 -2 13 -7c35 -42 57 -101 57 -172c0 -34 -6 -65 -17 -94c10 -31 17 -64 17 -96c0 -104 -60 -183 -122 -241c-63 -59 -57 -53 -61 -56c-38 -34 -63 -95 -71 -95h-22v190v190c40 7 69 11 87 16c116 36 175 111 175 197 c0 44 -15 91 -46 137zM248 463c-23 -48 -58 -89 -94 -122c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 19 -3 39 -7 57z'
          },
          3: {
            name: 'sym_flag_32nd_down',
            path: 'M248 463c-23 -48 -58 -89 -94 -122c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 19 -3 39 -7 57zM215 729c-5 8 -10 13 -11 16l-4 10c0 3 2 5 5 5s7 -2 13 -7c35 -42 58 -100 58 -171c0 -34 -6 -65 -17 -94 c10 -31 17 -64 17 -96c0 -36 -7 -69 -19 -99c9 -11 18 -32 19 -91v-6c0 -101 -61 -178 -122 -235c-63 -59 -57 -53 -61 -56c-38 -34 -51 -95 -59 -95h-34v190v190v190c40 7 69 11 87 16c116 36 174 110 174 196c0 44 -15 91 -46 137zM247 270c-23 -47 -58 -86 -93 -119 c-63 -59 -57 -53 -61 -56c-30 -27 -44 -71 -53 -88c20 3 36 6 47 9c88 27 168 95 168 200c0 26 -4 43 -8 54z'
          }
        }
      }

      const flagInfo = flagData[note.stemDir][note.flags]
      if (flagInfo) {
        const flagName = flagInfo.name
        const flagAvailable = defs.querySelector('#' + flagName)
        if (!flagAvailable) {
          console.warn(`Flag symbol ${flagName} not found in SVG defs`)
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
        flagUse.setAttribute('height', noteHeight + 'px')
        flagUse.setAttribute('width', noteWidth + 'px')

        const flagX = stemX - stemWidth / 2
        const flagY = note.stemDir === 'up' ? stemY1 : stemY2

        flagUse.setAttribute('x', flagX)
        flagUse.setAttribute('y', flagY)
        flagG.appendChild(flagUse)
      }
    }
  }

  staffG.appendChild(noteG)
}
