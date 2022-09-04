/*

Everything in `_runtime/${RUNTIME}/*` is accessible via `@/runtime/*` aka you can't access the wrong runtime:

  import { getRandomInt } from '@/runtime/numbers.js'

*/

export const getRandomInt = () => window.crypto.getRandomValues(new Uint32Array(1))[0]
