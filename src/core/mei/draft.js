import { renderNote } from './note.js'
import { renderRest } from './rest.js'
import { renderChord } from './chord.js'
import { renderAccid } from './accid.js'
import { renderClef } from './clef.js'
import { renderDot } from './dot.js'
import { renderMeterSig } from './meterSig.js'
import { renderBarLine } from './barLine.js'
import { renderBeam } from './beam.js'
import { renderDir } from './dir.js'
import { renderTempo } from './tempo.js'
import { renderDynam } from './dynam.js'
import { renderCurve } from './curve.js'
import { renderHairpin } from './hairpin.js'
import { renderTrill } from './trill.js'
import { renderOctave } from './octave.js'
import { renderFermata } from './fermata.js'
import { renderPedal } from './pedal.js'
import { renderWord } from './word.js'
import { renderFing } from './fing.js'
import { renderF } from './f.js'
import { renderDel } from './del.js'
import { renderArtic } from './artic.js'
import { renderNum } from './num.js'
import { renderLine } from './line.js'
import { renderMetaMarkClarification, renderMetaMarkNavigation } from './metaMark.js'

/**
 * Render single draft into the given SVG document
 * @param {string} draftId - ID of the draft element to render
 * @param {Document} meiDocument - MEI document
 * @param {SVGElement} svg - SVG element to render into
 * @param {Object} options - Rendering options
 */
export function renderDraft ({ label, genDescId, draftId, genDesc, draft }, svg, context) {
  const doc = svg.ownerDocument || (typeof document !== 'undefined' ? document : null)
  if (!doc) throw new Error('No SVG document context available')
  // console.log(`Rendering draft ${draftId} (${label}) with genDesc ${genDescId}`)

  /* if (context.dimensions.rotation) {
    svg.setAttribute('style', `transform: rotate(${context.dimensions.rotation}deg);`)
  } */

  // Create a group for the draft
  const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('class', 'draft')
  g.setAttribute('data-label', label)
  g.setAttribute('data-id', draftId)

  draft.systems.forEach(system => {
    const systemG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
    systemG.setAttribute('class', 'system')
    systemG.setAttribute('data-id', system.id)

    system.staves.forEach(staff => {
      const staffG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      staffG.setAttribute('class', 'staff')
      staffG.setAttribute('data-n', staff.n)
      staffG.setAttribute('data-rastrum', staff.rastrum || '')
      const rastrum = context.rastrums.find(r => r.id === staff.rastrum)
      staffG.setAttribute('style', 'transform: rotate(' + rastrum.rotate + 'deg); transform-origin: ' + rastrum.svgX + 'px ' + rastrum.svgY + 'px;')

      // Render notes
      staff.notes.forEach(note => {
        renderNote(note, staffG, rastrum, context, svg)
      })

      // Render rests
      staff.rests.forEach(rest => {
        renderRest(rest, staffG, rastrum, context, svg)
      })

      // Render chords
      staff.chords.forEach(chord => {
        renderChord(chord, staffG, rastrum, context, svg)
      })

      // Render accidentals
      staff.accids.forEach(accid => {
        renderAccid(accid, staffG, rastrum, context, svg)
      })

      // Render clefs
      staff.clefs.forEach(clef => {
        renderClef(clef, staffG, rastrum, context, svg)
      })

      // Render dots
      staff.dots.forEach(dot => {
        renderDot(dot, staffG, rastrum, context, svg)
      })

      // Render meterSigs
      staff.meterSigs.forEach(meterSig => {
        renderMeterSig(meterSig, staffG, rastrum, context, svg)
      })

      // Render articulations
      staff.artics.forEach(artic => {
        renderArtic(artic, staffG, rastrum, context, svg)
      })

      // Render tuplet numbers
      staff.tupletNums.forEach(num => {
        renderNum(num, staffG, rastrum, context, svg)
      })

      systemG.appendChild(staffG)
    })

    // handle controlEvents
    // Render bar lines
    system.controlEvents.barLines.forEach(barLine => {
      const rastrum = context.rastrums.find(r => r.id === barLine.rastrum)
      renderBarLine(barLine, systemG, rastrum, context, svg)
    })

    system.controlEvents.beams.forEach(beam => {
      const rastrum = context.rastrums.find(r => r.id === beam.rastrum)
      renderBeam(beam, systemG, rastrum, context, svg)
    })

    system.controlEvents.lines.forEach(line => {
      console.log(9375, line)
      const rastrum = context.rastrums.find(r => r.id === line.rastrum)
      renderLine(line, systemG, rastrum, context, svg)
    })

    system.controlEvents.repeats.forEach(repeat => {
      const rastrum = context.rastrums.find(r => r.id === repeat.rastrum)
      renderLine(repeat, systemG, rastrum, context, svg)
    })

    system.controlEvents.dirs.forEach(dir => {
      const rastrum = context.rastrums.find(r => r.id === dir.rastrum)
      renderDir(dir, systemG, rastrum, context, svg)
    })

    system.controlEvents.tempos.forEach(tempo => {
      const rastrum = context.rastrums.find(r => r.id === tempo.rastrum)
      renderTempo(tempo, systemG, rastrum, context, svg)
    })

    system.controlEvents.dynams.forEach(dynam => {
      const rastrum = context.rastrums.find(r => r.id === dynam.rastrum)
      renderDynam(dynam, systemG, rastrum, context, svg)
    })

    system.controlEvents.curves.forEach(curve => {
      const rastrum = context.rastrums.find(r => r.id === curve.rastrum)
      renderCurve(curve, systemG, rastrum, context, svg)
    })

    system.controlEvents.hairpins.forEach(hairpin => {
      const rastrum = context.rastrums.find(r => r.id === hairpin.rastrum)
      renderHairpin(hairpin, systemG, rastrum, context, svg)
    })

    system.controlEvents.trills.forEach(trill => {
      const rastrum = context.rastrums.find(r => r.id === trill.rastrum)
      renderTrill(trill, systemG, rastrum, context, svg)
    })

    system.controlEvents.octaves.forEach(octave => {
      const rastrum = context.rastrums.find(r => r.id === octave.rastrum)
      renderOctave(octave, systemG, rastrum, context, svg)
    })

    system.controlEvents.fermatas.forEach(fermata => {
      const rastrum = context.rastrums.find(r => r.id === fermata.rastrum)
      renderFermata(fermata, systemG, rastrum, context, svg)
    })

    system.controlEvents.pedals.forEach(pedal => {
      const rastrum = context.rastrums.find(r => r.id === pedal.rastrum)
      renderPedal(pedal, systemG, rastrum, context, svg)
    })

    system.controlEvents.words.forEach(word => {
      const rastrum = context.rastrums.find(r => r.id === word.rastrum)
      renderWord(word, systemG, rastrum, context, svg)
    })

    system.controlEvents.fings.forEach(fing => {
      const rastrum = context.rastrums.find(r => r.id === fing.rastrum)
      renderFing(fing, systemG, rastrum, context, svg)
    })

    system.controlEvents.fs.forEach(f => {
      const rastrum = context.rastrums.find(r => r.id === f.rastrum)
      renderF(f, systemG, rastrum, context, svg)
    })

    system.controlEvents.metaMarkClarifications.forEach(clarification => {
      const rastrum = context.rastrums.find(r => r.id === clarification.rastrum)
      renderMetaMarkClarification(clarification, systemG, rastrum, context, svg)
    })

    system.controlEvents.metaMarkNavigations.forEach(navigation => {
      const rastrum = context.rastrums.find(r => r.id === navigation.rastrum)
      renderMetaMarkNavigation(navigation, systemG, rastrum, context, svg)
    })

    g.appendChild(systemG)
  })

  const deletionsG = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  deletionsG.setAttribute('class', 'deletions')

  draft.deletions.forEach(del => {
    renderDel(del, deletionsG, context, svg)
  })

  g.appendChild(deletionsG)

  svg.appendChild(g)
}
