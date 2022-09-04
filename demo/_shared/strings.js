/*

Everything in `_shared` is accessible to all services and scripts via `@/shared` so for example:

  import { toBase64 } form '@/shared/strings.js'

*/

export const toBase64 = string => btoa(string)
