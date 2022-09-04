# 🧙‍♂️ mrln

`M`ono `R`epo `ln` (symlink)

CLI tool to set up your project with `node_modules` symlinks to consistently named folders.

## Install

The usual ways:

```bash
npm install mrln
```

## Run

There's really only one command:

```bash
mrln
```

You can add the command in your CI script and document it for local development, but you should probably to add it as a `postinstall` script in your repo:

```json
{
  "scripts": {
    "postinstall": "mrln"
  },
  "dependencies": {
  	"mrln": "^1.0.0"
  }
}
```

After you run `npm install` or `npm ci` the symlinks will get created.

## Example

Look in the [example folder](https://github.com/saibotsivad/mrln/tree/main/demo) for a sample monorepo setup.

## Summary

In your repo you have folders that contain:

* Code shared with all projects,
* Code specific to a runtime environment (e.g. NodeJS vs Browser vs ServiceWorker),
* Other bits of code, I don't know,
* Code specific to a service / application /etc.

Suppose you have a folder setup like this:

```
# Runtime independent code for all applications:
/shared
	/strings.js
		# export const lowercase = string => string.toLowerCase()

# Runtime specific code for all applications:
/runtime
	/nodejs
		/crypto.js
			# import { webcrypto } from 'node:crypto'
			# const grv = webcrypto.getRandomValues
			# export { grv as getRandomValues }
	/browser
		/crypto.js
			# export const { getRandomValues } = globalThis.crypto

# An example application:
/apps
	/server
		/lib
			/strings.js
				# export const toInt = string => parseInt(string, 10)
		/package.json
		/app.js
	/webapp
		# Available to any code in this application:
		/lib
			/strings.js
				# export const uppercase = string => string.toUpperCase()
		/package.json
		/app.js
```

Depending on configuration, running `mrln` might produce these symlinks:

```
/apps
	/server
		/node_modules
			/@
				/lib => /apps/server/lib
				/runtime => /runtime/nodejs
				/shared => /shared
	/webapp
		/node_modules
			/@
				/lib => /apps/webapp/lib
				/runtime => /runtime/browser
				/shared => /shared
```

Then from inside `/apps/server/app.js` you could do:

```js
// from: /apps/server/lib/strings.js
import { toInt } from '@/lib/strings.js'
// from /runtime/nodejs/crypto.js
import { getRandomValues } from '@/runtime/crypto.js'
// from /shared/strings.js
import { lowercase } from '@/shared/strings.js'
```

And from inside `/apps/webapp/app.js` you could do:

```js
// from: /apps/webapp/lib/strings.js
import { uppercase } from '@/lib/strings.js'
// from /runtime/browser/crypto.js
import { getRandomValues } from '@/runtime/crypto.js'
// from /shared/strings.js
import { lowercase } from '@/shared/strings.js'
```

## Configuration

Configuration is inside the `package.json` file under an object named `mrln`, e.g.:

```json
{
  "name": "my-mono-repo",
  "private": true,
  "mrln": {
	  "...": "..."
  }
}
```

You need one `package.json` file at the repo root, and one per "application".

### Root Configuration

At the root of the repo, the object has the following properties:

#### `prefix: String`

This will namespace the symlinks, so e.g. `import * from '@/shared/foo.js` the namespace `@` would be the `prefix`.

#### `links: Array<string>`

This tells `mrln` where your `package.json` files are for your "applications". Behind the scenes [tiny-glob](https://github.com/terkelg/tiny-glob), so e.g. if you had a folder setup like the earlier example you could do:

```
"mrln": {
  "links": [ "apps/*/package.json" ]
}
```

Or if your applications are all in root folders perhaps `*/package.json`, or name them explicitly:

```
"mrln": {
  "links": [
    "app1/package.json",
    "app2/package.json"
  ]
}
```

#### `root: Map<String, String>`

These are any mappings that are common to all "applications" that map to the repo root.

The key is to the namespaced import path, and the value is to the root-relative folder.

For example, if you had a folder structure like this:

```
/_common
	/foo.js
/apps
	/browser
		/main.js
		/package.json
```

And if you wanted the `main.js` file to be able to do `import '@/shared/foo.js'` than in the `package.json` of the "application" you would have:

```
"mrln": {
  "root": {
    "shared": "_common"
  }
}
```

Which would create a symlink like this:

```
/apps
	/browser
		/node_modules
			/@
				/shared => /_common
```

These symlinks would be created in *all* "applications", if the root folder exists.

#### `folder: Map<String, String>`

These are mappings that are common to all "applications" that map to the root *of the "application"*.

The key is to the namespaced import path, and the value is to the path *relative to the `package.json` file*.

For example, if you had a folder structure like this:

```
/apps
	/browser
		/_lib
			/widget.js
		/main.js
		/package.json
```

And if you wanted the `main.js` file to be able to do `import '@/lib/widger.js'` than in the `package.json` of the "application" you would have:

```
"mrln": {
  "folder": {
    "lib": "_lib"
  }
}
```

Which would create a symlink like this:

```
/apps
	/browser
		/node_modules
			/@
				/lib => /apps/browser/_lib
```

These symlinks would be created in *all* "applications", if the folder exists for that "application". (E.g., you can have `lib => _libs` in the root `package.json` and if the "application" doesn't have a `_lib` folder the symlink won't get made.)

### "Application" Configuration

In the `package.json` file for each "application", you can add or remove root or folder level symlinks using the `mrln` property, which is an object with the following properties:

#### `root: Map<String, String>`

This is the same as the repo-root level property: these map symlinks in a namespace to a root-relative path.

For example, runtime environment specific mappings might be:

```json
{
  "name": "service-1",
  "private": true,
  "type": "module",
  "mrln": {
    "root": {
      "runtime": "_runtime/nodejs"
    }
  }
}
```
Which would map `import '@/runtime/crypto.js` to `_runtime/nodejs/crypto.js` file.

To *remove* a mapping from the repo's overall `root` mappings, simply set the value in the application's `root` key to `null` or `false`, e.g.:

```
"mrln": {
  "root": {
    "shared": null
  }
}
```

#### `folder: Map<String, String>`

This is the same as the repo-root level property: these map symlinks in a namespace to an "application"-relative path.

For example, if you had a folder structure like this:

```
/apps
	/browser
		/_ui
			/Widget.js
		/main.js
		/package.json
```

And if you wanted the `main.js` file to be able to do `import '@/ui/Widget.js'` than in the `package.json` of the "application" you would have:

```
"mrln": {
  "folder": {
    "ui": "_ui"
  }
}
```

Which would create a symlink like this:

```
/apps
	/browser
		/node_modules
			/@
				/ui => /apps/browser/_ui
```

To *remove* a mapping from the repo's overall `folder` mappings, simply set the value in the application's `folder` key to `null`, e.g.:

```
"mrln": {
  "folder": {
    "shared": null
  }
}
```

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=mrln).
