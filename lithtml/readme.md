


I found an interesting pattern for having type autocompletion in VS Code without any build tools.

- Import everything from CDN with `import * as ...`
- install npm package to get types (or instally `@types/some-package` if available)
- JSDoc comment `@type {import('some-package')}` to annotate new variable while assigning whole package
- desctructure object with every property (tedious work to do once per package)

```js
// @ts-ignore
import * as allLit from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js'

/**
 * @type {import('lit')}
 */
const lit = allLit

export const {
  html,
  css,
  render,
  // ***
}
```

- ESLint & Prettier configured
- XState Store imported