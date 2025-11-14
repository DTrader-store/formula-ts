# VSCode TDX Formula Syntax Highlighting Extension Guide

## Overview

A complete VSCode extension providing professional syntax highlighting for TDX (Tongdaxin) formula language used in algorithmic trading systems.

## What's Included

The extension is located in the `vscode-extension/` directory with the following components:

### Core Files

```
vscode-extension/
├── package.json                      # Extension metadata and configuration
├── language-configuration.json       # Editor behavior (comments, brackets, etc.)
├── syntaxes/
│   └── tdx-formula.tmLanguage.json   # TextMate grammar definition
├── snippets/
│   └── snippets.json                 # 20+ code snippets
└── examples/
    └── example.tdx                   # Comprehensive example file
```

### Documentation

- **README.md** - Feature list, usage guide, and configuration
- **INSTALLATION_GUIDE.md** - Step-by-step installation for all platforms
- **test-syntax.tdx** - Complete test file covering all syntax elements

## Features

### Syntax Highlighting Categories

1. **Keywords**: `IF`, `THEN`, `ELSE`, `AND`, `OR`, `NOT`

2. **Built-in Functions** (24 functions):
   - Math: MA, EMA, SUM, MAX, MIN, ABS, SQRT, POW, MOD, ROUND
   - Reference: REF, HHV, LLV
   - Logical: CROSS, EVERY, EXIST, BARSLAST, COUNT
   - Statistics: STD, VAR, MEDIAN, AVEDEV
   - Technical: SMA, WMA, RSI, BOLL, ATR

3. **Operators**:
   - Arithmetic: `+`, `-`, `*`, `/`
   - Comparison: `>`, `<`, `>=`, `<=`, `=`, `<>`
   - Assignment: `:=`

4. **Market Data Fields**: OPEN, CLOSE, HIGH, LOW, VOLUME, AMOUNT

5. **Chart Attributes**:
   - Colors (8): COLORRED, COLORGREEN, COLORBLUE, COLORYELLOW, COLORWHITE, COLORBLACK, COLORCYAN, COLORMAGENTA
   - Line Thickness (10): LINETHICK0 through LINETHICK9
   - Line Styles (2): DOTLINE, STICK

6. **Comment Types**:
   - Single-line: `// comment`
   - Block: `{ comment }`

### Editor Features

- **Comment Toggling**: Ctrl+/ (Windows/Linux) or Cmd+/ (macOS)
- **Bracket Matching**: Automatic highlighting of matching brackets/parentheses
- **Auto-closing Pairs**: Automatic closing of quotes and brackets
- **Auto-indentation**: Intelligent indentation support
- **Snippets**: 20+ pre-built snippets for common patterns

## Installation Methods

### Method 1: Direct Installation (Recommended)

#### macOS/Linux:
```bash
cd ~/.vscode/extensions
git clone https://github.com/DTrader-store/formula-ts.git
cd formula-ts/vscode-extension
# Restart VSCode
```

#### Windows:
```powershell
cd $env:USERPROFILE\.vscode\extensions
git clone https://github.com/DTrader-store/formula-ts.git
cd formula-ts\vscode-extension
# Restart VSCode
```

### Method 2: Copy Extension Folder

1. Navigate to your VSCode extensions directory
2. Copy the `vscode-extension` folder and rename it to `tdx-formula-syntax-1.0.0`
3. Restart VSCode

### Method 3: Find Extensions Folder in VSCode

1. Open VSCode
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
3. Click the three-dot menu (⋯) → "Show Installed Extensions Folder"
4. Copy the extension folder there

## Verification

After installation:

1. Create a new file with `.tdx` extension
2. Type some formula code:
   ```tdx
   MA5 := MA(CLOSE, 5);
   IF(MA5 > OPEN, 1, 0);
   ```
3. Verify syntax highlighting is applied:
   - Keywords should be highlighted
   - Function names should have distinct colors
   - Numbers and operators should have different colors

## Usage Examples

### Simple Moving Average

```tdx
// Calculate 5-day and 10-day moving averages
MA5 := MA(CLOSE, 5);
MA10 := MA(CLOSE, 10);

// Draw them on chart
MA5, COLORRED, LINETHICK2;
MA10, COLORBLUE, LINETHICK1;
```

### MACD Indicator

```tdx
// MACD calculation
EMA12 := EMA(CLOSE, 12);
EMA26 := EMA(CLOSE, 26);
MACD := EMA12 - EMA26;
SIGNAL := EMA(MACD, 9);
HISTOGRAM := MACD - SIGNAL;

// Draw components
MACD, COLORRED;
SIGNAL, COLORBLUE, DOTLINE;
```

### Bollinger Bands

```tdx
// Bollinger Bands with 20-period MA and 2 standard deviations
MID := MA(CLOSE, 20);
STD20 := STD(CLOSE, 20);
UPPER := MID + 2 * STD20;
LOWER := MID - 2 * STD20;

// Draw bands
UPPER, COLORMAGENTA, LINETHICK1;
MID, COLORYELLOW, DOTLINE;
LOWER, COLORMAGENTA, LINETHICK1;
```

### Trading Signals

```tdx
// Golden cross buy signal
BUY := CROSS(MA(CLOSE, 5), MA(CLOSE, 10));

// RSI overbought/oversold
RSI14 := RSI(CLOSE, 14);
OVERBOUGHT := RSI14 > 70;
OVERSOLD := RSI14 < 30;

// Combined signal
SIGNAL := IF(BUY AND NOT OVERBOUGHT, 1, IF(OVERSOLD, -1, 0));
SIGNAL, COLORGREEN, STICK;
```

## Code Snippets

The extension includes 20+ snippets:

- `ma` → MA(data, period)
- `ema` → EMA(data, period)
- `if` → IF(condition, true_value, false_value)
- `cross` → CROSS(a, b)
- `ref` → REF(data, period)
- `hhv` → HHV(data, period)
- `llv` → LLV(data, period)
- `var` → name := value;
- `drawred` → expression, COLORRED, LINETHICK1;
- And more...

To use snippets:
1. Start typing the snippet prefix (e.g., `ma`)
2. Press Tab or Enter to expand
3. Use Tab to move between parameters

## Configuration

### Custom Color Theme

Add to your VSCode `settings.json`:

```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "keyword.control.tdx-formula",
        "settings": {
          "foreground": "#569cd6",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "support.function.tdx-formula",
        "settings": {
          "foreground": "#dcdcaa"
        }
      },
      {
        "scope": "constant.language.tdx-formula",
        "settings": {
          "foreground": "#4ec9b0"
        }
      }
    ]
  }
}
```

## Troubleshooting

### Extension Not Recognized

- Ensure VSCode has been restarted after installation
- Check that `package.json` exists in the extension folder
- Verify the folder is in the correct extensions directory

### Syntax Highlighting Not Applied

1. Check file extension is `.tdx` or `.formula`
2. Manually set language mode:
   - Click the language indicator (bottom-right)
   - Select "TDX Formula"
3. Reload the window: Press Ctrl+Shift+P → "Developer: Reload Window"

### Missing Syntax Highlighting

- Open DevTools: Ctrl+Shift+P → "Developer: Open DevTools"
- Check for errors in the console
- Verify the grammar file is valid JSON

## File Associations

The extension automatically associates with:
- `.tdx` files
- `.formula` files

To add other file extensions, edit `package.json`:
```json
{
  "extends": [".tdx", ".formula", ".my-formula"]
}
```

## Uninstallation

### Option 1: Via VSCode
1. Open Extensions (Ctrl+Shift+X)
2. Find "TDX Formula Syntax Highlighting"
3. Click "Uninstall"
4. Restart VSCode

### Option 2: Manual
1. Delete the extension folder from extensions directory
2. Restart VSCode

## Support and Contributing

- **Issues**: Report bugs on [GitHub Issues](https://github.com/DTrader-store/formula-ts/issues)
- **Feedback**: Suggestions for improvements are welcome
- **Contributing**: Submit pull requests for enhancements

## License

MIT License - See LICENSE file in the repository

## Version Information

- Extension Version: 1.0.0
- Minimum VSCode Version: 1.50.0
- Supported Platforms: Windows, macOS, Linux

## Related Resources

- [TDX Formula Documentation](docs/)
- [VSCode Extension API](https://code.visualstudio.com/api/language-extensions/overview)
- [TextMate Grammar Guide](https://macromates.com/manual/en/language_grammars)
- [Main Repository](https://github.com/DTrader-store/formula-ts)
