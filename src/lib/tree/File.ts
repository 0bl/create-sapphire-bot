export class File {
	public readonly name: string;
	public readonly contents: string;

	public constructor(name: string, contents: string | string[]) {
		// If it's an array, join the lines:
		if (Array.isArray(contents)) contents = contents.join('\n');

		// If it doesn't end with EOF, append it:
		if (!contents.endsWith('\n')) contents += '\n';

		this.name = name;
		this.contents = contents;
	}
}
