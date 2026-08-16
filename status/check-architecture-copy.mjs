#!/usr/bin/env node
/**
 * [R27-ARCH-01] `status/architecture-review.html` is a COPY of
 * `crowagent-platform/tools/arch-visualizer/index.html`. This fails if they have
 * diverged.
 *
 * WHY A COPY EXISTS AT ALL. The status server serves `crowagent-website/status`
 * only, and the architecture review lives in the platform repository. The owner
 * asked for one status surface rather than two places to look, so the document is
 * copied here to be served. A copy that can drift silently is a defect, which is
 * what this exists to prevent.
 *
 * WHY IT IS NOT WIRED INTO CI, stated rather than left as an omission. The source
 * and the copy sit in DIFFERENT REPOSITORIES, and neither repository's CI checks
 * out the other, so a CI step here could only ever report that it could not find
 * the source. That is a gate which cannot fail for the right reason, and this
 * release has spent a great deal of effort removing those. It is a local check,
 * run from `status/start-tracker.cmd` or by hand.
 *
 * If it fails: edit the SOURCE, then re-copy. Never edit the copy, because the
 * next re-copy would silently discard the edit.
 */

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const COPY = join(HERE, 'architecture-review.html')
const SOURCE = join(HERE, '..', '..', 'crowagent-platform', 'tools', 'arch-visualizer', 'index.html')

if (!existsSync(COPY)) {
  console.error(`FAILED: ${COPY} is missing. The Architecture tab will 404.`)
  process.exit(1)
}
if (!existsSync(SOURCE)) {
  // CANNOT CHECK is not a pass. Reporting it as one is how a guard starts lying.
  console.error(
    `CANNOT CHECK: the source is not at ${SOURCE}.\n` +
      `The copy may be stale and this script cannot tell. Exiting 2 rather than 0, ` +
      `because "I did not look" and "I looked and it was fine" must not share an exit code.`,
  )
  process.exit(2)
}

const sourceText = readFileSync(SOURCE, 'utf8')
const copyText = readFileSync(COPY, 'utf8')

// The copy carries a provenance banner this script wrote; compare what follows it.
const marker = '-->\n'
const idx = copyText.indexOf(marker)
const copyBody = idx === -1 ? copyText : copyText.slice(idx + marker.length)

const sha = (t) => createHash('sha256').update(t, 'utf8').digest('hex')
const a = sha(sourceText)
const b = sha(copyBody)

// CONTROL: a comparison over an empty string would pass for the wrong reason.
if (sourceText.length < 1000) {
  console.error(`FAILED: the source is only ${sourceText.length} bytes. That is not the document.`)
  process.exit(1)
}

if (a !== b) {
  console.error(
    `FAILED: status/architecture-review.html has DIVERGED from the arch visualiser.\n` +
      `  source ${SOURCE}  sha256 ${a.slice(0, 16)}  ${sourceText.length} bytes\n` +
      `  copy   architecture-review.html      sha256 ${b.slice(0, 16)}  ${copyBody.length} bytes\n\n` +
      `Edit the SOURCE and re-copy. Do not edit the copy: the next re-copy discards it.`,
  )
  process.exit(1)
}

console.log(`architecture-review.html matches the source (sha256 ${a.slice(0, 16)}, ${sourceText.length} bytes).`)
