/*

Things inside a `_lib` folder are constrained to that service via `import '@/lib/*'`, e.g.

  import { multiply } from '@/lib/multiply.js'

*/

export const multiply = (...numbers) => {
	let out = numbers.pop()
	for (const num of numbers) out = out * num
	return out
}
