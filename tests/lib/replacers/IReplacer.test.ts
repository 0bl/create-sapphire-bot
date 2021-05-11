import { IReplacer } from '../../../src';

describe('IReplacer', () => {
	test('GIVEN typeof IReplacer THEN returns function', () => {
		expect(typeof IReplacer).toBe('function');
	});

	test('GIVEN instanceof IReplacer.exportRegExp THEN returns RegExp', () => {
		expect(IReplacer['exportRegExp']).toBeInstanceOf(RegExp);
	});

	test('GIVEN instanceof IReplacer.importRegExp THEN returns RegExp', () => {
		expect(IReplacer['importRegExp']).toBeInstanceOf(RegExp);
	});
});
