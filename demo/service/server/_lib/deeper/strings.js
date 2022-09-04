/*

Things inside a `_lib` folder are constrained to that service via `import '@/lib/*'`, e.g.

  import { makeSmall } from '@/lib/strings.js'

Here we're importing a lib from a deeper folder, to make sure IDEs handle it correctly.

*/

export const makeSmall = string => string.toLowerCase()
