# Asset Pipeline Guide (AI + Approval)

## Goals
- Keep raw AI outputs separate from approved game assets
- Use repeatable atlas builds for animation/runtime efficiency
- Preserve metadata for provenance and approvals

## Directory Structure
```
assets-source/
  <pack-name>/
    raw/                  # raw AI generations (videos/images)
    prompts/              # prompt text + model settings
    notes.md              # approval notes and decisions

src/assets/processed/
  <pack-name>/
    <free-tex-packer files / frame folders>

src/assets/atlases/
  <pack-name>/
    *.png
    *.json
```

## Naming Convention
Use:
`type_subject_variant_action_v###`

Example:
- `char_blobpink_default_walk_v003`
- `fx_comet_intro_trail_v001`

## Metadata (per approved pack)
Create `metadata.json` inside each processed pack:
```json
{
  "assetId": "char_blobpink_default_walk_v003",
  "sourceModel": "<model-name>",
  "sourceDate": "2026-02-06",
  "approvedBy": "<name>",
  "license": "internal",
  "notes": "Approved for production"
}
```

## Build Atlases
Run:
```bash
npm run assets:atlas
```

The script scans `src/assets/processed/*` and builds Pixi atlas outputs to `src/assets/atlases/*`.

## Approval Workflow
1. Generate asset candidates in `assets-source/<pack>/raw`
2. Review and approve selected candidates
3. Export cleaned frames into `src/assets/processed/<pack>`
4. Add metadata and version name
5. Run atlas build
6. Wire atlas in runtime config
