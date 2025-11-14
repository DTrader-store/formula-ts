# TDX Formula Syntax Highlighting - Installation Guide

This guide provides step-by-step instructions for installing the TDX Formula Syntax Highlighting extension.

## Quick Installation

### On macOS

1. Open Terminal and navigate to your extensions folder:
   ```bash
   cd ~/.vscode/extensions
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/DTrader-store/formula-ts.git
   cd formula-ts/vscode-extension
   ```

3. Restart VSCode

### On Windows

1. Open PowerShell or Command Prompt

2. Navigate to your extensions folder:
   ```powershell
   cd $env:USERPROFILE\.vscode\extensions
   ```

3. Clone the repository:
   ```powershell
   git clone https://github.com/DTrader-store/formula-ts.git
   cd formula-ts\vscode-extension
   ```

4. Restart VSCode

### On Linux

1. Open Terminal and navigate to your extensions folder:
   ```bash
   cd ~/.vscode/extensions
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/DTrader-store/formula-ts.git
   cd formula-ts/vscode-extension
   ```

3. Restart VSCode

## Manual Installation Steps

### Step 1: Locate VSCode Extensions Directory

Find your VSCode extensions directory:

- **macOS**: `~/.vscode/extensions/`
- **Windows**: `%USERPROFILE%\.vscode\extensions\`
- **Linux**: `~/.vscode/extensions/`

You can also open VSCode and find the path:
1. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
2. Click the three-dot menu (⋯) and select "Show Installed Extensions Folder"

### Step 2: Copy Extension Files

Copy the `vscode-extension` folder to your extensions directory:

```bash
cp -r /path/to/formula-ts/vscode-extension ~/.vscode/extensions/tdx-formula-syntax-1.0.0
```

### Step 3: Restart VSCode

Close and reopen VSCode, or:
- Press Cmd+Shift+P / Ctrl+Shift+P
- Run: "Developer: Reload Window"

## Verification

After installation, verify the extension works:

1. Create a new file with `.tdx` extension
2. Write some formula code:
   ```tdx
   MA5 := MA(CLOSE, 5);
   IF(MA5 > OPEN, 1, 0);
   ```

3. Check that syntax highlighting is applied:
   - Keywords like `IF` should be highlighted
   - Function names like `MA` should be highlighted differently
   - Numbers and operators should have distinct colors

## Uninstallation

To remove the extension:

1. Delete the extension folder from your extensions directory
2. Restart VSCode

Or use VSCode's extension manager:
1. Open Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Find "TDX Formula Syntax Highlighting"
3. Click "Uninstall"

## Troubleshooting

### Extension Not Showing Up

- Check that the `package.json` file exists in the extension directory
- Verify the folder name matches the pattern expected by VSCode
- Try renaming the folder to: `tdx-formula-syntax-1.0.0`

### Syntax Highlighting Not Working

- Make sure you've restarted VSCode after installation
- Check that your file has the `.tdx` or `.formula` extension
- Try opening the file with the command palette:
  1. Press Cmd+Shift+P / Ctrl+Shift+P
  2. Run: "Change Language Mode"
  3. Select "TDX Formula"

### Mixed Content Issues

If you see red squiggles everywhere:
1. This might be because the language wasn't properly associated
2. Manually set the language:
   - Click the language indicator in the bottom-right (e.g., "Plain Text")
   - Select "TDX Formula"

## Advanced Configuration

### Custom Color Theme

To customize syntax highlighting colors, add this to your VSCode `settings.json`:

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

### Language Configuration

The language configuration includes:

- **Comment Toggle**: Ctrl+/ or Cmd+/
- **Block Comments**: Enclosed in `{` and `}`
- **Line Comments**: Starting with `//`
- **Auto-indentation**: Automatic when entering new lines
- **Bracket Matching**: Highlights matching brackets and parentheses
- **Auto-closing Pairs**: Automatically closes quotes and brackets

## Support

For issues, questions, or suggestions:

1. Check the main README.md for feature documentation
2. Open an issue on [GitHub](https://github.com/DTrader-store/formula-ts/issues)
3. Include your VSCode version and extension version in bug reports

## Version Information

- Extension Version: 1.0.0
- Minimum VSCode Version: 1.50.0
- Platform: macOS, Windows, Linux

## License

MIT License - See LICENSE file for details
