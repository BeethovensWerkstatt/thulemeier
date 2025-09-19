/**
 * Calculate rendering dimensions
 * @param {Document} meiDocument - MEI document
 * @param {Object} options - Rendering options
 * @returns {Object} Dimension settings
 */
export function calculateDimensions (meiDocument, options) {
  // TODO: Extract dimensions from MEI document or use defaults

  let width, height
  const surface = meiDocument.querySelector('surface')
  if (surface) {
    const allFolia = [...meiDocument.querySelectorAll('foliaDesc *')]
    const surfaceId = surface.getAttribute('xml:id')
    const match = '#' + surfaceId
    const folium = allFolia.find(folium =>
      folium.getAttribute('outer.recto') === match ||
      folium.getAttribute('inner.verso') === match ||
      folium.getAttribute('inner.recto') === match ||
      folium.getAttribute('outer.verso') === match ||
      folium.getAttribute('recto') === match ||
      folium.getAttribute('verso') === match)

    if (folium) {
      width = parseFloat(folium.getAttribute('width')) || 300
      height = parseFloat(folium.getAttribute('height')) || 240
    } else {
      width = 300
      height = 240
    }
  }

  const scaling = options.baseScaling || 90

  return {
    width,
    height,
    viewBox: `0 0 ${width * scaling} ${height * scaling}`
  }
}
