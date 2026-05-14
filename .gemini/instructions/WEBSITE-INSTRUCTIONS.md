# Gemini CLI Instructions for `crowagent-website`

## State Recovery Hook
**MANDATORY:** Every time you start a new session or resume work in this repository, you MUST immediately read `.gemini/state/TRANSFORMATION-STATE.md`.
This file serves as the definitive state tracking mechanism to recover from terminal interrupts or sudden crashes.
- Do not make assumptions about the current phase of work without reading the state file.
- Update `.gemini/state/TRANSFORMATION-STATE.md` meticulously as you complete tasks.

## Transformation Specifications
- **Requirements:** `.gemini/specs/WEBSITE-REQUIREMENTS.md`
- **Design:** `.gemini/specs/WEBSITE-DESIGN.md`
- **Execution:** `.gemini/specs/WEBSITE-EXECUTION.md`

## Constraints
- **Scope Lock:** When working in this repository, you are strictly limited to the marketing website (`crowagent-website`). Do NOT modify the platform or portal repositories unless explicitly requested.
- **Tech Stack:** 100% Vanilla HTML/CSS/JS. No build steps (except static pre-generation like purges or image compression).
- **Deployment:** NO production deployments without explicit user approval. All verification must be done via localhost (`npx http-server -p 8083`).
