export abstract class IReplacer {
	public abstract readonly name: string;

	public replace(value: string): string {
		return value
			.replace(IReplacer.importRegExp, (_, from, variables) => this.replaceImport(from.trim(), variables?.trim().split(' ') ?? []))
			.replace(IReplacer.exportRegExp, (_, to) => this.replaceExport(to?.trim() || null));
	}

	protected abstract replaceImport(from: string, variables: string[]): string;
	protected abstract replaceExport(name: string | null): string;

	private static readonly importRegExp = /\{import(?:\:([@\w\d\-\.\/]+)(?:,([$\w\d ]+))?)?\}/g;
	private static readonly exportRegExp = /\{export(?::([$\w\d]+))?\}/;
}
