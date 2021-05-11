import { Directory, File } from '../../../src';

describe('Directory', () => {
	test('GIVEN empty directory THEN has no entries', () => {
		const directory = new Directory('src');

		expect(directory.name).toBe('src');
		expect(directory.size).toBe(0);
	});

	test('GIVEN file overload THEN it creates a File', () => {
		const directory = new Directory('src');
		const name = 'index.js';

		expect(directory.add(name, 'Foo Bar'));
		expect(directory.size).toBe(1);

		const file = directory.get(name) as File;
		expect(file).not.toBeUndefined();
		expect(file.name).toBe(name);
		expect(file.contents).toBe('Foo Bar\n');
	});

	test('GIVEN directory overload THEN it creates a Directory', () => {
		const directory = new Directory('src');
		const name = 'commands';

		expect(directory.add(name, (commands) => commands));
		expect(directory.size).toBe(1);

		const nestedDirectory = directory.get(name) as Directory;
		expect(nestedDirectory).not.toBeUndefined();
		expect(nestedDirectory.name).toBe(name);
		expect(nestedDirectory.size).toBe(0);
	});
});
