/*

Things inside a `_lib` folder are constrained to that service via `import '@/lib/*'`, e.g.

  import { makeBig } from '@/lib/make-big.js'

*/

export const makeBig = (word) => {
	return word.toUpperCase()
}
