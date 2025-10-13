import javascript from '@tobiaslabs/eslint-config-javascript'
export default [
	...javascript.config,
	{
		...javascript.environment.nodejs,
		files: [ 'bin.js', 'src/**/*.js' ],
	},
	{
		...javascript.environment.browser,
		files: [ 'demo/**/*.js' ],
	},
]
