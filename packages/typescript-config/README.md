# `@awfixersites/typescript-config` (deprecated)

Canonical TypeScript presets live under **`../../src/`**:

| Old file | Use instead |
|----------|-------------|
| `base.json` | `src/tsconfig.base.json` |
| `nextjs.json` | `src/tsconfig.next.json` |
| `react-library.json` | `src/tsconfig.react-library.json` |

Apps extend `src/tsconfig.next.json`. Workspace packages (auth, db, ui, mdx, content) extend `src/tsconfig.react-library.json`. Node-only packages (e.g. `env`) extend `src/tsconfig.package.json`.

This package remains as thin re-exports for any external references; new work should not add dependencies on it.