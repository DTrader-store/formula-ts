# TDX Formula Syntax Highlighting

VSCode extension providing syntax highlighting for TDX (Tongdaxin) formula language used in algorithmic trading systems.

## Features

### Syntax Highlighting

- **Keywords**: `IF`, `AND`, `OR`, `THEN`, `ELSE`, `NOT`
- **Functions**:
  - Math: `MA`, `EMA`, `SUM`, `MAX`, `MIN`, `ABS`, `SQRT`, `POW`, `MOD`, `ROUND`
  - Reference: `REF`, `HHV`, `LLV`
  - Logical: `CROSS`, `EVERY`, `EXIST`, `BARSLAST`, `COUNT`
  - Statistics: `STD`, `VAR`, `MEDIAN`, `AVEDEV`
  - Technical: `SMA`, `WMA`, `RSI`, `BOLL`, `ATR`
- **Operators**:
  - Arithmetic: `+`, `-`, `*`, `/`
  - Comparison: `>`, `<`, `>=`, `<=`, `=`, `<>`
  - Assignment: `:=`
  - Logical: `AND`, `OR`
- **Market Data Fields**: `OPEN`, `CLOSE`, `HIGH`, `LOW`, `VOL`, `VOLUME`, `AMOUNT`
- **Chart Attributes**:
  - Colors: `COLORRED`, `COLORGREEN`, `COLORBLUE`, `COLORYELLOW`, `COLORWHITE`, `COLORBLACK`, `COLORCYAN`, `COLORMAGENTA`
  - Line Thickness: `LINETHICK0` through `LINETHICK9`
  - Line Styles: `DOTLINE`, `STICK`

### Comment Support

- Single-line comments: `// comment`
- Block comments: `{ comment }`

### Editor Features

- Auto-indentation
- Bracket matching and auto-closing
- Comment toggling

## Installation

### Option 1: Manual Installation (Local)

1. Navigate to your VSCode extensions directory:
   - **macOS**: `~/.vscode/extensions/`
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **Linux**: `~/.vscode/extensions/`

2. Clone or copy this extension folder:
   ```bash
   git clone https://github.com/DTrader-store/formula-ts.git
   cp -r formula-ts/vscode-extension tdx-formula-syntax-1.0.0
   ```

3. Restart VSCode

### Option 2: Install from VSIX (if packaged)

1. Download the `.vsix` file
2. Open VSCode Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run: `Extensions: Install from VSIX...`
4. Select the `.vsix` file

## Usage

1. Create a new file with `.tdx` or `.formula` extension
2. Write your TDX formula code
3. Syntax highlighting will be applied automatically

### Example Formula

```tdx
// Simple moving average crossover strategy
MA1 := MA(CLOSE, 5);
MA2 := MA(CLOSE, 10);

SIGNAL := IF(MA1 > MA2, 1, -1);

// Draw the moving averages
MA1, COLORRED, LINETHICK2;
MA2, COLORBLUE, LINETHICK1;

// Draw signal
SIGNAL, COLORGREEN;
```

## Supported File Extensions

- `.tdx` - TDX formula file
- `.formula` - Generic formula file

## Configuration

The extension works out of the box with sensible defaults. For fine-tuning syntax highlighting colors, add this to your VSCode `settings.json`:

```json
{
  "editor.tokenColorCustomizations": {
    "comments": "#6a9955",
    "keywords": "#569cd6",
    "functions": "#dcdcaa",
    "numbers": "#b5cea8",
    "strings": "#ce9178",
    "operators": "#d4d4d4"
  }
}
```

## Language Definition

This extension recognizes the following language identifiers:
- Language ID: `tdx-formula`
- Display Name: TDX Formula

## Known Limitations

- Limited support for advanced language features
- Snippets not included in this version
- No built-in debugging support

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug reports
- Feature requests
- Syntax improvements
- Documentation enhancements

## License

MIT - See LICENSE file for details

## References

- [VSCode Language Extension Documentation](https://code.visualstudio.com/api/language-extensions/overview)
- [TextMate Grammar Documentation](https://macromates.com/manual/en/language_grammars)
- TDX Formula Documentation (external)

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/DTrader-store/formula-ts/issues).
