# MLP Workflow Routing

Read constraint-map.md for ownership. Use the reference relevant to the work.

| Task | Reference | Verification |
|---|---|---|
| New project or requirements | prd-standard.md, template-contract.md | Scaffold self-review |
| Prototype design or edit | prototype-design.md, visual-standard.md | Build and inspect visual hierarchy and the affected experience |
| Components, motion, overlays or state feedback | visual-standard.md, component-patterns.md | Build, exercise initial/changed/final states and inspect transitions |
| Routes, states or workbench | template-contract.md | mlp:route-check |
| Annotation data | template-contract.md | mlp:annotation-acceptance |
| Framework refresh or migration | framework-refresh.md | mlp:acceptance |
| Deployment | deployment.md | Contract-specific technical checks |
| Requested or useful screenshot comparison | visual-standard.md | mlp:visual-review |

mlp:fast-check builds with the framework/PRD prebuild review. mlp:route-check adds browser runtime checks; layout measurements are advisory. mlp:acceptance adds annotation validation. mlp:visual-acceptance is available when screenshot evidence is useful, not mandatory for every UI edit. mlp:export-ai exports the text handoff.

Do not reject product designs because they differ from template dimensions, components, palette or page composition.
