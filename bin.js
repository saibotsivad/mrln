#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { readFile, mkdir, symlink } from 'node:fs/promises'

import glob from 'tiny-glob'

const CWD = process.cwd()

const readJson = async filepath => {
	try {
		return JSON.parse(await readFile(filepath, 'utf8'))
	} catch (ignore) {
		return {}
	}
}

const removeFalse = obj => {
	for (const key in obj) if (obj[key] === false) delete obj[key]
	return obj
}

const { mrln: { prefix, links, root, folder } } = await readJson('./package.json')

const makeLinks = async ({ linkDir, isRoot, map }) => {
	const pkgList = Object.keys(map)
	if (pkgList.length) {
		for (const toMake of pkgList) {
			console.log(`  ${toMake} => ${isRoot ? 'CWD:' : ''}${map[toMake]}`)
			const sym = join(linkDir, 'node_modules', prefix, toMake)
			const original = isRoot
				? map[toMake]
				: join(linkDir, map[toMake])
			await symlink(join(CWD, original), join(CWD, sym), { type: 'junction' })
		}
	}
}

let linkables = new Set()
for (const l of links)
	for (const g of (await glob(l))) linkables.add(g)

for (const link of linkables) {
	const { mrln } = await readJson(link)
	const linkRoot = removeFalse(Object.assign({}, root || {}, mrln?.root || {}))
	const linkFolder = removeFalse(Object.assign({}, folder || {}, mrln?.folder || {}))
	if (Object.keys(linkRoot).length || Object.keys(linkFolder).length) {
		const linkDir = dirname(link)
		console.log(linkDir)
		await mkdir(join(linkDir, 'node_modules', prefix), { recursive: true })
		await makeLinks({ linkDir, isRoot: true, map: linkRoot })
		await makeLinks({ linkDir, isRoot: false, map: linkFolder })
	}
}
