/**
 * @typedef Answers
 * @property {string} type - Type of generator
 * @property {string} name - Name of the file(s) or project
 * @property {string} description - Description of the file or project
 * @property {string?} frontmatter - If creating Markdown page, string of frontmatter
 * @property {boolean?} flow - If creating a React component, will Flow be used?
 * @property {string?} props - If creating a React component, string of props
 * @property {string?} testType - If creating a test, is it an integration or unit test
 * @property {string?} variables - If creating a template, string of variables that will be used in the template
 */

export type Answers = {
	template: {
		filename: string;
		prettyName: string;
		content: string;
		extension: string;
	};
	outputName: string;
	props: Array<{ name: string; value: string }>;
};

declare module '*.json' {
	const value: any;
	export default value;
}