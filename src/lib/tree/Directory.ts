/* eslint-disable @typescript-eslint/unified-signatures */
import { File } from './File';

export class Directory extends Map<string, File | Directory> {
	public readonly name: string;

	public constructor(name: string) {
		super();
		this.name = name;
	}

	/**
	 * Adds a file to the directory.
	 * @param name The name of the file to add.
	 * @param contents The contents for said file.
	 */
	public add(name: string, contents: string | string[]): this;

	/**
	 * Adds a directory to the directory.
	 * @param name The name of the folder to add.
	 * @param cb The callback taking a directory.
	 */
	public add(name: string, cb: (directory: Directory) => Directory): this;
	public add(name: string, contents: string | string[] | ((directory: Directory) => Directory)): this {
		this.set(name, typeof contents === 'function' ? contents(new Directory(name)) : new File(name, contents));
		return this;
	}
}
