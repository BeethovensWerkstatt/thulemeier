const meterSigWidth = 576
const meterSigHeight = 576

/**
 * Renders a single meterSig into the given staff group
 * @param {Object} meterSig - the meterSig object parsed from MEI in mei-parser.js
 * @param {SVGElement} staffG - the staff group element to render the meterSig into
 * @param {Object} rastrum - the rastrum object containing positioning information
 * @param {Object} context - the rendering context
 * @param {SVGElement} svg - the root SVG element
 */
export function renderMeterSig (meterSig, staffG, rastrum, context, svg) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')

  const rastrumX = rastrum.svgX
  const vuStepSize = rastrum.vuStepSize
  const loc0Y = rastrum.loc0Y

  const defs = svg.querySelector('defs')

  const count = meterSig.count || null
  const countSymbolId = 'sym_meterSig_' + count

  const unit = meterSig.unit || null
  const unitSymbolId = 'sym_meterSig_' + unit

  const sym = meterSig.sym || null
  const symSymbolId = sym ? 'sym_meterSig_' + sym : null

  const addSymbol = (id, defs) => {
    console.warn(`Meter signature symbol ${id} not found in SVG defs`)
    const symbol = doc.createElementNS('http://www.w3.org/2000/svg', 'symbol')
    symbol.setAttribute('id', id)
    symbol.setAttribute('viewBox', '0 0 1000 1000')
    symbol.setAttribute('overflow', 'inherit')

    const path = doc.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('transform', 'scale(1,-1)')

    let d
    switch (id) {
      case 'sym_meterSig_1':
        d = 'M68 -250v36c23 0 40 6 49 18c8 14 12 33 12 57v250l-82 -129l-27 13l107 255h128v-394c0 -24 5 -42 14 -53s25 -17 47 -17v-36h-248z'
        break
      case 'sym_meterSig_2':
        d = 'M124 -185c-18 0 -55 -14 -65 -65h-36l-3 30c0 25 6 45 18 63c11 19 22 30 39 43l121 82l37 29c15 11 27 29 38 54c12 24 18 47 18 70c0 40 -19 88 -94 88c-25 0 -32 0 -50 -8c-14 -5 -23 -12 -26 -22c3 -9 7 -15 10 -18l24 -17c12 -7 17 -11 27 -21c5 -7 7 -16 7 -27 c0 -12 0 -57 -79 -74c-30 0 -76 26 -76 94c0 66 81 135 197 135c72 0 181 -32 181 -150c0 -53 -32 -95 -113 -133l-91 -41c-26 -11 -45 -23 -57 -37l49 7c84 0 115 -41 148 -41c20 0 33 20 39 61h35c0 -152 -68 -168 -114 -168c-17 0 -65 0 -79 7h10l-28 17 c-49 37 -69 40 -87 42z'
        break
      case 'sym_meterSig_3':
        d = 'M208 250c97 0 177 -52 177 -116c0 -69 -40 -111 -118 -125c56 -5 125 -44 125 -116c0 -31 -10 -57 -31 -78c-19 -21 -45 -38 -78 -49l-50 -11c-15 -3 -36 -7 -55 -7c-50 0 -86 16 -113 38c-16 10 -23 18 -34 34c-7 13 -11 25 -11 38c0 43 27 83 68 83l3 -2 c61 0 75 -42 75 -70c0 -19 -24 -42 -26 -57c7 -17 20 -25 37 -25c44 0 94 29 94 78c0 75 -34 125 -138 125v36c84 0 131 22 131 98c0 54 -37 88 -87 88c-26 0 -43 -7 -51 -22c15 -22 44 -16 44 -70c0 -37 -37 -62 -71 -62c-22 0 -69 15 -69 76c0 79 101 116 178 116z'
        break
      case 'sym_meterSig_4':
        d = 'M20 -78c84 97 114 180 134 329h170c-13 -32 -82 -132 -99 -151l-84 -97c-33 -36 -59 -63 -80 -81h162v102l127 123v-225h57v-39h-57v-34c0 -43 19 -65 57 -65v-34h-244v36c48 0 60 26 60 70v27h-203v39z'
        break
      case 'sym_meterSig_5':
        d = 'M161 38c-14 0 -56 -5 -92 -51h-32l5 263c55 -11 108 -18 158 -18c40 0 85 6 134 17c-8 -52 -39 -114 -159 -114l-50 2c-19 2 -31 4 -49 10l-5 -111c38 26 81 39 129 39c94 0 177 -64 177 -159c0 -100 -98 -166 -211 -166c-88 0 -146 53 -146 115c0 53 39 83 75 83 c37 0 69 -32 69 -72c0 -4 -1 -10 -4 -18l-27 -37c-2 -3 -3 -8 -3 -14c0 -15 12 -23 36 -23c74 0 92 77 92 132s-35 122 -97 122z'
        break
      case 'sym_meterSig_6':
        d = 'M284 -91c0 37 -28 92 -67 92c-35 0 -65 -54 -65 -111c0 -52 22 -104 68 -104c47 0 64 68 64 123zM230 214c-36 0 -90 -33 -90 -184l2 -36c40 24 81 36 120 36c80 0 140 -48 140 -121c0 -99 -99 -159 -182 -159c-160 0 -200 173 -200 244c0 21 2 43 7 71l10 35 c26 85 73 115 98 126c41 19 74 24 103 24c93 0 142 -63 142 -105c0 -58 -52 -72 -73 -72c-33 0 -59 24 -65 35c-3 5 -6 14 -7 25l11 30c6 15 9 27 9 35c0 11 -9 16 -25 16z'
        break
      case 'sym_meterSig_7':
        d = 'M350 125c-11 -9 -53 -46 -95 -46c-18 2 -33 8 -44 17c-17 19 -33 34 -48 45c-13 11 -27 17 -42 17c-23 0 -45 -22 -64 -66h-37v155h37c4 -18 11 -28 21 -30c8 1 15 3 22 8l10 5l14 10c3 2 14 6 21 7l11 2c8 1 33 1 42 1c39 0 57 -7 90 -43c11 -15 26 -23 44 -26 c27 3 45 29 54 70l38 -1c-1 -9 -11 -88 -29 -124c-5 -13 -12 -28 -21 -46l-33 -60c-55 -92 -69 -162 -69 -270h-174c0 45 11 86 33 122c23 35 59 74 106 117c99 84 113 96 113 136z'
        break
      case 'sym_meterSig_8':
        d = 'M195 -214c76 0 88 58 90 68c0 34 -35 60 -57 73l-52 29c-21 10 -32 17 -34 20c-39 -33 -58 -54 -62 -92c5 -23 23 -98 115 -98zM301 135c0 61 -72 76 -113 76c-40 0 -77 -17 -77 -51c3 -21 15 -38 26 -50c17 -15 33 -26 48 -34l65 -28c34 27 51 56 51 87zM176 -250 c-57 0 -166 26 -166 132c0 47 30 86 89 116c-33 15 -79 60 -79 119c0 79 85 132 178 132h18c5 0 21 1 28 -1c25 0 126 -30 126 -110c0 -37 -23 -76 -69 -116c43 -25 83 -71 83 -119c0 -101 -118 -153 -208 -153z'
        break
      case 'sym_meterSig_9':
        d = 'M139 107c0 -51 22 -104 66 -104c38 0 64 48 64 110c0 50 -31 100 -64 100c-40 0 -66 -56 -66 -106zM114 -74c40 0 72 -27 72 -65c0 -8 -3 -19 -9 -34l-7 -16l-5 -15c2 -8 12 -12 31 -12c56 0 84 73 84 219c-32 -24 -71 -36 -119 -36c-29 0 -56 6 -79 20 c-51 26 -57 78 -62 108c0 64 56 155 188 155c158 0 197 -151 197 -237c0 -145 -92 -263 -207 -263c-109 0 -155 68 -155 101c0 46 33 75 71 75z'
        break
      case 'sym_meterSig_0':
        d = 'M229 251zM230 -250c-99 0 -210 94 -210 251c0 152 93 250 209 250s205 -119 205 -250c0 -139 -103 -251 -204 -251zM139 1c0 -79 13 -215 88 -215c68 0 84 112 84 215c0 76 -15 216 -84 216c-68 0 -88 -136 -88 -216z'
        break
      case 'sym_meterSig_+':
        d = 'M253 -28h-99v-98h-56v98h-98v57h98v97h56v-97h99v-57z'
        break
      case 'sym_meterSig_-':
        d = 'M0 -37v74h342v-74h-342z'
        break
      case 'sym_meterSig_*':
        d = 'M334 115l-115 -115l115 -115l-52 -52l-115 115l-115 -115l-52 52l115 115l-115 115l52 52l115 -115l115 115z'
        break
      case 'sym_meterSig_/':
        d = 'M49 -243l-49 25l137 461l49 -25z'
        break
      case 'sym_meterSig_common':
        d = 'M340 179c-9 24 -56 41 -89 41c-46 0 -81 -28 -100 -58c-17 -28 -25 -78 -25 -150c0 -65 2 -111 8 -135c8 -31 18 -49 40 -67c20 -17 43 -25 70 -25c54 0 92 36 115 75c14 25 23 54 28 88h27c0 -63 -24 -105 -58 -141c-35 -38 -82 -56 -140 -56c-45 0 -83 13 -115 39 c-57 45 -101 130 -101 226c0 59 33 127 68 163c36 37 97 72 160 72c36 0 93 -21 121 -40c11 -8 23 -17 33 -30c19 -23 27 -48 27 -76c0 -51 -35 -88 -86 -88c-43 0 -76 27 -76 68c0 26 7 35 21 51c15 17 32 27 58 32c7 2 14 7 14 11z'
        break
      case 'sym_meterSig_cut':
        d = 'M188 200c-42 -22 -63 -69 -63 -141v-119c0 -39 7 -70 19 -94s26 -40 44 -48v402zM0 -0c0 127 80 220 186 246v72h32l-6 -72c33 0 71 0 101 -11c54 -20 102 -65 102 -135c0 -16 -4 -30 -13 -43s-20 -24 -32 -29l-20 -8l-23 -3c-22 2 -41 8 -55 21s-21 31 -26 51 c0 38 45 80 79 80c12 0 19 3 19 10c0 6 -6 12 -15 18c-19 13 -47 24 -79 24c-10 0 -20 -1 -32 -5v-431c15 -3 12 -4 30 -4c57 0 100 51 121 93l17 39c3 13 5 25 5 35h26c-6 -70 -28 -121 -66 -152s-82 -47 -133 -47v-68h-30v72c-57 10 -122 54 -153 109c-7 12 -13 26 -19 42 c-11 29 -16 61 -16 96z'
        break
    }
    path.setAttribute('d', d)
    symbol.appendChild(path)
    defs.appendChild(symbol)
  }

  const usesNumbers = count && unit && !sym

  if (usesNumbers) {
    const countSymbolAvailable = defs.querySelector('#' + countSymbolId)
    if (!countSymbolAvailable) {
      addSymbol(countSymbolId, defs)
    }
    const unitSymbolAvailable = defs.querySelector('#' + unitSymbolId)
    if (!unitSymbolAvailable) {
      addSymbol(unitSymbolId, defs)
    }
  } else {
    const symSymbolAvailable = defs.querySelector('#' + symSymbolId)
    if (!symSymbolAvailable) {
      addSymbol(symSymbolId, defs)
    }
  }

  // Create the meterSig group
  const meterSigG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  meterSigG.setAttribute('class', 'meterSig')
  meterSigG.setAttribute('data-id', meterSig.id)

  const x = rastrumX + (meterSig.x * context.options.baseScaling || 0)
  const y1 = loc0Y - (6 * vuStepSize)
  const y2 = loc0Y - (4 * vuStepSize)
  const y3 = loc0Y - (2 * vuStepSize)

  if (usesNumbers) {
    const use1 = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
    use1.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${countSymbolId}`)
    use1.setAttribute('height', meterSigHeight + 'px')
    use1.setAttribute('width', meterSigWidth + 'px')
    use1.setAttribute('data-role', 'count')

    use1.setAttribute('x', x)
    use1.setAttribute('y', y1)
    meterSigG.appendChild(use1)

    const use2 = use1.cloneNode(true)
    use2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${unitSymbolId}`)
    use2.setAttribute('data-role', 'unit')
    use2.setAttribute('y', y3)
    meterSigG.appendChild(use2)
  } else if (sym) {
    const symUse = doc.createElementNS('http://www.w3.org/2000/svg', 'use')
    symUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${symSymbolId}`)
    symUse.setAttribute('height', meterSigHeight + 'px')
    symUse.setAttribute('width', meterSigWidth + 'px')

    symUse.setAttribute('x', x)
    symUse.setAttribute('y', y2)
    meterSigG.appendChild(symUse)
  }

  staffG.appendChild(meterSigG)
}
