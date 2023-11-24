#!/usr/bin/env node

import { dirname, join, relative } from 'node:path'
import { readFile, readlink, mkdir, symlink, writeFile } from 'node:fs/promises'

import glob from 'tiny-glob'

const CWD = process.cwd()
const UPDATE_JSCONFIG = !!process.argv.includes('--jsconfig')

const die = message => {
	console.log(message)
	process.exit(1)
}

const readJson = async filepath => {
	try {
		return JSON.parse(await readFile(filepath, 'utf8'))
	} catch (ignore) {
		return {}
	}
}

const clone = obj => JSON.parse(JSON.stringify(obj)) // not the fastest, but fine for this

const removeFalse = obj => {
	for (const key in obj) if (obj[key] === false || obj[key] === null) delete obj[key]
	return obj
}

const rootPkg = await readJson('package.json')
if (!rootPkg?.mrln) die('No "mrln" property found in package.json file.')
const { prefix, links, root, folder, jsconfig } = rootPkg.mrln

const logBadSymlink = (symlinkAbsolutePath, relativeSymlinkPath, existing) => console.error(`
Found an existing symlink, but it points to an unexpected location.

Location: ${symlinkAbsolutePath}
Desired:  ${relativeSymlinkPath}
Existing: ${existing}
`)

const makeLinks = async ({ linkDir, isRoot, map }) => {

	let anyBadExisting = false
	const checkExistingSymlink = async (symlinkAbsolutePath, relativeSymlinkPath) => {
		const existing = await readlink(symlinkAbsolutePath)
		if (existing !== relativeSymlinkPath) {
			logBadSymlink(symlinkAbsolutePath, relativeSymlinkPath, existing)
			anyBadExisting = true
		}
	}

	const pkgList = Object.keys(map)
	if (pkgList.length) {
		for (const toMake of pkgList) {
			console.log(`  ${toMake} => ${isRoot ? 'CWD:' : ''}${map[toMake]}`)
			const sym = join(linkDir, 'node_modules', prefix, toMake)
			const original = isRoot
				? map[toMake]
				: join(linkDir, map[toMake])
			const symlinkAbsolutePath = join(CWD, sym)
			const relativeSymlinkPath = relative(join(CWD, sym, '..'), join(CWD, original))
			await symlink(relativeSymlinkPath, symlinkAbsolutePath, { type: 'junction' })
				.catch(error => {
					if (error.code === 'EEXIST') return checkExistingSymlink(symlinkAbsolutePath, relativeSymlinkPath)
					else throw error
				})
		}
	}

	if (anyBadExisting) throw new Error('Existing symlink points to unexpected location.')
}

const updateJsconfig = async ({ linkDir, linkRoot, linkFolder }) => {
	const existing = await readJson(join(linkDir, 'jsconfig.json'))
	const updatedCompilerOptions = Object.assign(
		{ paths: {} },
		existing.compilerOptions || {},
		clone(jsconfig?.compilerOptions || {}),
	)
	for (const name in linkRoot) {
		const importable = `${prefix}/${name}/*`
		const paths = updatedCompilerOptions.paths[importable] || []
		paths.push(`${relative(join(CWD, linkDir), CWD)}/${linkRoot[name]}/*`)
		updatedCompilerOptions.paths[importable] = [ ...new Set(paths) ]
	}
	for (const name in linkFolder) {
		const importable = `${prefix}/${name}/*`
		const paths = updatedCompilerOptions.paths[importable] || []
		paths.push(`${linkFolder[name]}/*`)
		updatedCompilerOptions.paths[importable] = [ ...new Set(paths) ]
	}
	existing.compilerOptions = updatedCompilerOptions
	await writeFile(join(linkDir, 'jsconfig.json'), JSON.stringify(existing, undefined, jsconfig?.indent || 2) + '\n')
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
		if (UPDATE_JSCONFIG) await updateJsconfig({ linkDir, linkRoot, linkFolder })
	}
}
