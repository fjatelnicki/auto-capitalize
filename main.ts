import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AutoCapitalizeSettings {
	exceptionPatterns: string[];
	preserveCapitalizationWords: string[];
}

const DEFAULT_SETTINGS: AutoCapitalizeSettings = {
	exceptionPatterns: ['Q:', 'A:'],
	preserveCapitalizationWords: []
}

export default class AutoCapitalizePlugin extends Plugin {
	settings: AutoCapitalizeSettings;

	async onload() {
		await this.loadSettings();

		// Add command to auto-capitalize links
		this.addCommand({
			id: 'auto-capitalize-links',
			name: 'Auto-capitalize links in note',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				this.autoCapitalizeLinks(editor);
			}
		});

		// Add settings tab
		this.addSettingTab(new AutoCapitalizeSettingTab(this.app, this));
	}

	autoCapitalizeLinks(editor: Editor) {
		const content = editor.getValue();
		const lines = content.split('\n');
		const modifiedLines: string[] = [];
		let changesCount = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const modifiedLine = this.processLine(line, i === 0);

			if (modifiedLine !== line) {
				changesCount++;
			}

			modifiedLines.push(modifiedLine);
		}

		if (changesCount > 0) {
			editor.setValue(modifiedLines.join('\n'));
			new Notice(`Auto-capitalized ${changesCount} link(s)`);
		} else {
			new Notice('No changes needed');
		}
	}

	processLine(line: string, isFirstLine: boolean): string {
		// Find all [[...]] links in the line
		const linkRegex = /\[\[([^\]]+)\]\]/g;
		let result = line;
		let offset = 0;

		// Find all matches first to avoid issues with string manipulation
		const matches: { index: number; length: number; content: string }[] = [];
		let match;

		while ((match = linkRegex.exec(line)) !== null) {
			matches.push({
				index: match.index,
				length: match[0].length,
				content: match[1]
			});
		}

		// Process each match
		for (const matchInfo of matches) {
			const linkContent = matchInfo.content;
			const position = matchInfo.index + offset;

			// Determine what should happen to this link
			const newContent = this.determineCapitalization(
				linkContent,
				line,
				matchInfo.index,
				isFirstLine
			);

			if (newContent !== linkContent) {
				// Replace the link content
				const before = result.substring(0, position);
				const after = result.substring(position + matchInfo.length);
				const newLink = `[[${newContent}]]`;
				result = before + newLink + after;

				// Adjust offset for subsequent replacements
				offset += newLink.length - matchInfo.length;
			}
		}

		return result;
	}

	determineCapitalization(linkContent: string, line: string, linkIndex: number, isFirstLine: boolean): string {
		// Check if this link is after an exception pattern (e.g., "Q:", "A:", "F:", "T:")
		const beforeLink = line.substring(0, linkIndex).trim();

		for (const pattern of this.settings.exceptionPatterns) {
			// Check if the text before the link ends with this pattern
			if (beforeLink.endsWith(pattern)) {
				return this.capitalizeFirst(linkContent);
			}

			// Also check for pattern at start of line or after whitespace
			const patternRegex = new RegExp(`(?:^|\\s)${this.escapeRegex(pattern)}\\s*$`);
			if (patternRegex.test(beforeLink)) {
				return this.capitalizeFirst(linkContent);
			}
		}

		// Check if this is at the beginning of a sentence
		if (this.isAtSentenceStart(line, linkIndex, isFirstLine)) {
			return this.capitalizeFirst(linkContent);
		}

		// Otherwise, it's in the middle of a sentence - make it lowercase
		return this.lowercaseFirst(linkContent);
	}

	isAtSentenceStart(line: string, linkIndex: number, isFirstLine: boolean): boolean {
		const beforeLink = line.substring(0, linkIndex).trim();

		// If nothing before the link (start of line)
		if (beforeLink === '') {
			return true;
		}

		// Check if the text before ends with sentence-ending punctuation
		const sentenceEnders = ['.', '?', '!'];

		for (const ender of sentenceEnders) {
			if (beforeLink.endsWith(ender)) {
				return true;
			}
			// Also check for punctuation followed by space (already trimmed, so check second-to-last)
			const lastNonSpace = beforeLink.trimEnd();
			if (lastNonSpace.endsWith(ender)) {
				return true;
			}
		}

		return false;
	}

	capitalizeFirst(text: string): string {
		if (text.length === 0) return text;
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	lowercaseFirst(text: string): string {
		if (text.length === 0) return text;
		if (text.length >= 2 && text.charAt(0) === text.charAt(0).toUpperCase() && text.charAt(1) === text.charAt(1).toUpperCase() && /[A-Z]/.test(text.charAt(1))) {
			return text;
		}
		const firstWord = text.split(/\s/)[0];
		for (const word of this.settings.preserveCapitalizationWords) {
			if (firstWord === word) {
				return text;
			}
		}
		return text.charAt(0).toLowerCase() + text.slice(1);
	}

	escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class AutoCapitalizeSettingTab extends PluginSettingTab {
	plugin: AutoCapitalizePlugin;

	constructor(app: App, plugin: AutoCapitalizePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Auto Capitalize Links Settings' });

		containerEl.createEl('p', {
			text: 'Configure patterns that should trigger capitalization. Links appearing after these patterns will always be capitalized (e.g., "Q:", "A:", "F:", "T:").',
			cls: 'setting-item-description'
		});

		// Display current patterns
		new Setting(containerEl)
			.setName('Exception patterns')
			.setDesc('Patterns after which links should always be capitalized');

		// List existing patterns with delete buttons
		const patternsContainer = containerEl.createDiv('auto-capitalize-patterns-list');
		this.renderPatternsList(patternsContainer);

		// Add new pattern
		new Setting(containerEl)
			.setName('Add new pattern')
			.setDesc('Enter a pattern (e.g., "F:", "Note:", "Definition:")')
			.addText(text => {
				text.setPlaceholder('Enter pattern (e.g., F:)');
				return text;
			})
			.addButton(button => {
				button
					.setButtonText('Add')
					.setCta()
					.onClick(async () => {
						const input = button.buttonEl.parentElement?.querySelector('input');
						if (input && input.value.trim()) {
							const newPattern = input.value.trim();

							// Check if pattern already exists
							if (this.plugin.settings.exceptionPatterns.includes(newPattern)) {
								new Notice('Pattern already exists');
								return;
							}

							this.plugin.settings.exceptionPatterns.push(newPattern);
							await this.plugin.saveSettings();
							input.value = '';

							// Refresh the patterns list
							this.renderPatternsList(patternsContainer);
							new Notice(`Added pattern: ${newPattern}`);
						}
					});
			});

		containerEl.createEl('h3', { text: 'Preserve capitalization' });

		containerEl.createEl('p', {
			text: 'Words that should never be decapitalized (e.g., proper nouns like "Fourier", "Tbilisi").',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
			.setName('Preserved words')
			.setDesc('Words that will keep their original capitalization');

		const wordsContainer = containerEl.createDiv('auto-capitalize-words-list');
		this.renderWordsList(wordsContainer);

		new Setting(containerEl)
			.setName('Add new word')
			.setDesc('Enter a word to preserve (e.g., "Fourier", "Tbilisi")')
			.addText(text => {
				text.setPlaceholder('Enter word (e.g., Fourier)');
				return text;
			})
			.addButton(button => {
				button
					.setButtonText('Add')
					.setCta()
					.onClick(async () => {
						const input = button.buttonEl.parentElement?.querySelector('input');
						if (input && input.value.trim()) {
							const newWord = input.value.trim();

							if (this.plugin.settings.preserveCapitalizationWords.includes(newWord)) {
								new Notice('Word already exists');
								return;
							}

							this.plugin.settings.preserveCapitalizationWords.push(newWord);
							await this.plugin.saveSettings();
							input.value = '';

							this.renderWordsList(wordsContainer);
							new Notice(`Added word: ${newWord}`);
						}
					});
			});
	}

	renderPatternsList(container: HTMLElement): void {
		container.empty();

		if (this.plugin.settings.exceptionPatterns.length === 0) {
			container.createEl('p', {
				text: 'No exception patterns configured.',
				cls: 'setting-item-description'
			});
			return;
		}

		this.plugin.settings.exceptionPatterns.forEach((pattern, index) => {
			new Setting(container)
				.setName(pattern)
				.addButton(button => {
					button
						.setButtonText('Remove')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.exceptionPatterns.splice(index, 1);
							await this.plugin.saveSettings();
							this.renderPatternsList(container);
							new Notice(`Removed pattern: ${pattern}`);
						});
				});
		});
	}

	renderWordsList(container: HTMLElement): void {
		container.empty();

		if (this.plugin.settings.preserveCapitalizationWords.length === 0) {
			container.createEl('p', {
				text: 'No preserved words configured.',
				cls: 'setting-item-description'
			});
			return;
		}

		this.plugin.settings.preserveCapitalizationWords.forEach((word, index) => {
			new Setting(container)
				.setName(word)
				.addButton(button => {
					button
						.setButtonText('Remove')
						.setWarning()
						.onClick(async () => {
							this.plugin.settings.preserveCapitalizationWords.splice(index, 1);
							await this.plugin.saveSettings();
							this.renderWordsList(container);
							new Notice(`Removed word: ${word}`);
						});
				});
		});
	}
}
