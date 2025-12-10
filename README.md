# Auto Capitalize Links

An Obsidian plugin that automatically adjusts the capitalization of wiki-style links (`[[link]]`) based on their position in sentences.

## Features

- **Smart capitalization**: Automatically capitalizes links at the beginning of sentences
- **Middle-of-sentence lowercasing**: Converts links to lowercase when they appear in the middle of sentences
- **Customizable exception patterns**: Define patterns (like `Q:`, `A:`, `F:`, `T:`) where links should always be capitalized
- **Command-based**: Activate the capitalization with a simple command from the command palette

## How It Works

The plugin processes all links in the active note based on these rules:

1. **Beginning of sentence**: Links at the start of a line or after sentence-ending punctuation (`.`, `?`, `!`) are capitalized
   - Example: `[[power]] is important` → `[[Power]] is important`
   - Example: `This is energy. [[power]] is different` → `This is energy. [[Power]] is different`

2. **Middle of sentence**: Links in the middle of sentences are converted to lowercase
   - Example: `The [[Power]] consumption` → `The [[power]] consumption`

3. **Exception patterns**: Links after configured patterns (like `Q:` or `A:`) are always capitalized
   - Example: `Q: What is [[energy]]?` → `Q: What is [[energy]]?` (no change, already follows rule)
   - Example: `A: [[power]]` → `A: [[Power]]` (capitalized after exception pattern)

## Usage

1. Open a note in Obsidian
2. Open the command palette (`Ctrl/Cmd + P`)
3. Search for "Auto-capitalize links in note"
4. Run the command
5. The plugin will process all links in the note and show a notification with the number of changes made

## Configuration

### Adding Exception Patterns

Exception patterns are special labels after which links should always be capitalized (useful for flashcards, Q&A, etc.).

1. Go to Settings → Auto Capitalize Links
2. In the "Add new pattern" section, enter your pattern (e.g., `F:`, `T:`, `Note:`)
3. Click "Add"
4. The pattern will now be recognized when processing links

### Removing Exception Patterns

1. Go to Settings → Auto Capitalize Links
2. Find the pattern you want to remove in the list
3. Click the "Remove" button next to it

**Default patterns**: `Q:` and `A:` are included by default for flashcard support.

## Example

### Before:
```
[[Power]] is the rate at which work is done. In everyday language, [[Power]] is "how fast" you use fuel.

Q: In everyday language: is "how fast" you use fuel more like [[energy]] or [[power]]?
A: [[power]]
```

### After running the command:
```
[[Power]] is the rate at which work is done. In everyday language, [[power]] is "how fast" you use fuel.

Q: In everyday language: is "how fast" you use fuel more like [[energy]] or [[power]]?
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
