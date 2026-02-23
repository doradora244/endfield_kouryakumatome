# claude.md

This file explains the project direction for Claude (and other AI coding assistants).

## Project

- Name: Endfield strategy + growth + damage calculator hub
- Goal: Build a practical web tool for Arknights: Endfield players
- Current principle: Ship MVP fast, keep architecture extensible

## Core Product Scope

1. Information hub
- character list + filters + search
- character detail pages
- material list + reverse lookup
- update history

2. Growth utility
- simple upgrade cost calculator
- input: current level, target level, owned materials (optional)
- output: total required and shortage materials

3. Future combat utility
- staged damage engine (simple damage -> DPS rotation -> simulation)

## Non-Negotiable Architecture Rules

1. Separate display data and calculation data
- Never mix UI display fields and combat math fields in one loose schema.

2. Keep calculation engines independent from UI
- Put logic under dedicated modules (example: `lib/calculation/damageEngine.ts`).
- UI must call pure functions; no formula logic inside components.

3. Every data record must include metadata for trust and versioning
- `version`
- `source` (official / in-game / community verification)
- `confidence` (confirmed / provisional / testing)
- `updated_at`

4. Build for change
- Assume game patches will change values and formulas.
- Make version diffs and update logs first-class features.

## MVP Checklist (Phase 1)

1. Define data schema:
- Character
- Material
- CharacterUpgradeCost

2. Implement pages:
- `/characters` list with filters (rarity, element, role, weapon)
- `/characters/[id]` detail (overview, skills, growth, build, meta fields)
- `/materials` list + reverse lookup
- `/updates` changelog

3. Implement utility:
- basic growth cost calculator

4. Ensure completion criteria:
- browse character list/detail
- reverse lookup for materials
- shortage calculation for growth
- visible update history
- data model ready for future damage calculator

## Suggested Tech Stack

- Next.js + TypeScript + Tailwind
- Static JSON in MVP
- Later: Supabase/PostgreSQL

## Suggested Folder Layout

```text
src/
  app/
    characters/
    materials/
    calculator/
    updates/
  components/
    character/
    material/
    calculator/
    common/
  lib/
    data/
    calculation/
      damageEngine.ts
      growthCostEngine.ts
    utils/
data/
  characters.json
  character_stats.json
  character_skills.json
  materials.json
  upgrade_costs.json
  enemies.json
```

## Damage Calculator Roadmap

1. Stage 1: Simple damage comparison
- inputs: ATK, multiplier, crit, element modifier, buffs, enemy DEF/resist, hit count
- outputs: per-hit, total, expected crit value, scenario compare

2. Stage 2: Practical DPS
- add CT, rotation time, support buffs, status/element interactions
- output rotation DPS and total damage

3. Stage 3: Advanced simulation
- timeline simulation, resistance changes, RNG distribution, multi-rotation compare

## Working Style Guidance for Claude

- Prioritize data model and engine boundaries before visual polish.
- Deliver in phases; avoid overbuilding v1.
- Explicitly label provisional values in UI.
- When formulas change, update changelog and version tags in the same PR.

## Source of Truth

- Full Japanese product specification:
  - `docs/END_FIELD_SPEC.md`
