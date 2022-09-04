import { saveJson } from '@/runtime/save-json.js'
import { makeBig } from '@/lib/make-big.js'
import { toBase64 } from '@/shared/strings.js'
import { makeSmall } from '@/lib/deeper/strings.js'

const json = await saveJson('./example.json', { big: makeBig('bar'), small: makeSmall('BIZ'), secret: toBase64('battery-horse-staple') })

console.log(json)
