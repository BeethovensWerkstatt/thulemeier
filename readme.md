# Thulemeier

Thulemeier is a facsimile rendering library for diplomatic transcriptions based on MEI, developed by the _Beethovens Werkstatt_ project.

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Rendering Modes

Thulemeier supports five rendering modes:

### `fullPage`
Renders all rastrums (staff lines) on a page along with all drafts (diplomatic transcripts) found in the MEI document.

**Use case:** Complete page visualization with all writing zones.

```javascript
import { render } from 'thulemeier'
const svg = await render(meiDocument, { mode: 'fullPage' })
```

### `emptyPage`
Renders only the rastrums (empty staff lines) without any musical content.

**Use case:** Visualizing the physical layout of staff systems on a manuscript page.

```javascript
const svg = await render(meiDocument, { mode: 'emptyPage' })
```

### `singleDraft`
Renders a specific draft (writing zone) identified by its ID, without rendering the underlying staff lines.

**Use case:** Rendering just the musical content of a diplomatic transcript for overlay on facsimile images.

**Required option:** `id` - The `xml:id` of the draft element to render

```javascript
const svg = await render(meiDocument, { 
  mode: 'singleDraft',
  id: 'draft-id-here'
})
```

### `singleDraftStandalone`
Renders a specific draft along with only the rastrums (staff lines) that are actually used by that draft.

**Use case:** Creating standalone visualizations of diplomatic transcripts with their staff context, optimized for file size by including only relevant rastrums.

**Required option:** `id` - The `xml:id` of the draft element to render

```javascript
const svg = await render(meiDocument, { 
  mode: 'singleDraftStandalone',
  id: 'draft-id-here'
})
```

### `singleSystem`
Renders a specific system from a specific draft, along with only the rastrums (staff lines) used by that system.

**Use case:** Creating individual system visualizations for assembly into virtual continuous staves across multiple pages. Optimized for file size by including only the rastrums needed for that specific system.

**Required options:** 
- `id` - The `xml:id` of the draft element
- `systemId` - The `xml:id` of the system element to render

```javascript
const svg = await render(meiDocument, { 
  mode: 'singleSystem',
  id: 'draft-id-here',
  systemId: 'system-id-here'
})
```

## API

### `render(input, options)`

Main rendering function.

**Parameters:**
- `input` - MEI document as DOM Document or XML string
- `options` - Rendering options object
  - `mode` - Rendering mode (required): `'fullPage'`, `'emptyPage'`, `'singleDraft'`, `'singleDraftStandalone'`, or `'singleSystem'`
  - `id` - Draft ID (required for `'singleDraft'`, `'singleDraftStandalone'`, and `'singleSystem'` modes)
  - `systemId` - System ID (required for `'singleSystem'` mode)
  - `outputPath` - Optional file path to save SVG (Node.js only)
  - `baseScaling` - Base scaling factor (default: 90)

**Returns:** `Promise<SVGElement>` - The rendered SVG element

### `supportedModes()`

Returns an array of supported rendering mode names.

### `version()`

Returns the current version string.

