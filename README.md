# Auto Capitalize Links

An Obsidian plugin that automatically adjusts the capitalization of wiki-style links (`[[link]]`) based on their position in sentences.

## Features

-   **Smart capitalization**: Automatically capitalizes links at the beginning of sentences
-   **Middle-of-sentence lowercasing**: Converts links to lowercase when they appear in the middle of sentences
-   **Customizable exception patterns**: Define patterns (like `Q:`, `A:`, `F:`, `T:`) where links should always be capitalized
-   **Command-based**: Activate the capitalization with a simple command from the command palette

## How It Works

The plugin processes wiki links (`[[...]]`) in the active note, line-by-line, using these rules (in this order):

1. **Exception patterns (highest priority)**: If a link appears immediately after an exception pattern (optionally separated by whitespace), it is capitalized

    - Example: `Q: [[energy]]` → `Q: [[Energy]]`
    - Example: `A:    [[power]]` → `A:    [[Power]]`

2. **Beginning of sentence**: Links at the start of a line or after sentence-ending punctuation (`.`, `?`, `!`) are capitalized

    - Example: `[[power]] is important` → `[[Power]] is important`
    - Example: `This is energy. [[power]] is different` → `This is energy. [[Power]] is different`

3. **Middle of sentence**: Otherwise, the plugin attempts to lowercase only the first character of the link

    - Example: `The [[Power]] consumption` → `The [[power]] consumption`

4. **Preserve capitalization (prevents lowercasing)**: When applying the “middle of sentence” rule, the plugin will keep the link text unchanged in these cases:
    - **Acronym-ish start**: If the link starts with two uppercase letters (e.g. `[[HTTPServer]]`), it is left unchanged
    - **Multi-word with capitals after the first word**: If the link has multiple words and any word after the first starts with an uppercase letter (e.g. `[[new York]]`), it is left unchanged
    - **Preserved words list**: If the first word of the link exactly matches a configured preserved word (case-sensitive), it is left unchanged

Notes:

-   Only wiki links matching `[[...]]` are processed (not Markdown links like `[text](url)`).
-   The plugin changes only the first character of the `[[...]]` content (it does not title-case whole words).

## Usage

1. Open a note in Obsidian
2. Open the command palette (`Ctrl/Cmd + P`)
3. Search for "Auto-capitalize links in note"
4. Run the command
5. The plugin will process all links in the note and show a notification with the number of changes made

## Configuration

### Adding Exception Patterns

Exception patterns are special labels after which a link should always be capitalized (useful for flashcards, Q&A, etc.). The link must appear immediately after the pattern (optionally with whitespace in between).

1. Go to Settings → Auto Capitalize Links
2. In the "Add new pattern" section, enter your pattern (e.g., `F:`, `T:`, `Note:`)
3. Click "Add"
4. The pattern will now be recognized when processing links

### Removing Exception Patterns

1. Go to Settings → Auto Capitalize Links
2. Find the pattern you want to remove in the list
3. Click the "Remove" button next to it

**Default patterns**: `Q:` and `A:` are included by default for flashcard support.

### Preserving Capitalization Words

Preserved words prevent the plugin from lowercasing a link in the middle of a sentence if the link’s first word exactly matches one of these words.

1. Go to Settings → Auto Capitalize Links
2. In the "Add new word" section, enter a word (e.g., `Fourier`, `Tbilisi`)
3. Click "Add"

## Example

### Before:

```
[[Power]] is the rate at which work is done. In everyday language, [[Power]] is "how fast" you use fuel.

Q: [[energy]] or [[power]]?
A: [[power]]
```

### After running the command:

```
[[Power]] is the rate at which work is done. In everyday language, [[power]] is "how fast" you use fuel.

Q: [[Energy]] or [[power]]?
A: [[Power]]
```

## Installation

### Manual Installation

1. Copy the `main.js` and `manifest.json` files to your vault's plugins folder:
    - `<vault>/.obsidian/plugins/auto-capitalize/`
2. Reload Obsidian
3. Enable the plugin in Settings → Community Plugins

### Building from Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Copy `main.js` and `manifest.json` to your vault's plugins folder

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode (auto-rebuild on changes)
npm run dev
```

## Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

## License

MIT
