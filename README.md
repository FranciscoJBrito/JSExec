<div align="center">
  <img src="build-asset/icon.png" alt="JSExec Logo" width="128" height="128">
  
  # JSExec
  
  **The Ultimate JavaScript & TypeScript Playground**
  
  *Open source alternative to RunJS*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Electron](https://img.shields.io/badge/Electron-Latest-blue.svg)](https://electronjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Monaco Editor](https://img.shields.io/badge/Monaco-VS%20Code%20Editor-blue.svg)](https://microsoft.github.io/monaco-editor/)
  
</div>

---

## Key Features

### Complete Language Support
- **Native JavaScript** - Full ES2020+ execution
- **Official TypeScript** - Microsoft transpiler integrated
- **Automatic detection** of syntax
- **Real-time transpilation** without configuration

### Advanced Customization
- **Multiple themes**: GitHub Dark, Tomorrow Night Bright
- **5 professional fonts**: JetBrains Mono, Fira Code, Consolas, Monaco, Menlo
- **Multi-language**: English & Spanish
- **Persistent configuration** in real-time

### World-Class Editor
- **Monaco Editor** (same as VS Code)
- **Complete IntelliSense** with tooltips and autocompletion
- **Advanced syntax highlighting**
- **Real-time parameter suggestions**
- **Bracket pair colorization** and indentation guides

### Intelligent Execution
- **Smart auto-run** - Only executes complete code
- **Security system** with timeouts and limits
- **Complete sandbox** for isolated execution
- **Detailed timestamps** and log types

### User Experience
- **Complete file management** (New, Open, Save)
- **Professional keyboard shortcuts**
- **Intuitive settings panel**
- **Responsive and modern interface**

## Quick Start

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** (included with Node.js)
- **macOS, Windows, or Linux**

### Installation

```bash
# Clone the repository
git clone [https://github.com/franciscojavierbrito/jsexec.git](https://github.com/FranciscoJBrito/JSExec.git)
cd JSExec

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build

```bash
# Create executable for your platform
npm run make

# Package only (without installer)
npm run package

# Clean build files
npm run clean
```

### Immediate Usage

1. **Open JSExec** and you'll see the editor ready
2. **Write code** in JavaScript or TypeScript
3. **Automatic execution** when code is complete
4. **Customize** themes, fonts and language in Settings

## Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **Execute** | `⌘R` / `Ctrl+R` | Runs the current code |
| **Save** | `⌘S` / `Ctrl+S` | Saves the current file |
| **New** | `⌘N` / `Ctrl+N` | Creates a new file |
| **Open** | `⌘O` / `Ctrl+O` | Opens an existing file |
| **Clear** | `⌘K` / `Ctrl+K` | Clears the output |
| **Settings** | `⌘,` / `Ctrl+,` | Opens the settings panel |

## Technology Stack

### Frontend & UI
- **Monaco Editor** - VS Code editor integrated
- **TypeScript** - Main project language
- **CSS3** - Modern and responsive styles
- **Font Awesome** - Professional iconography

### Build & Development
- **Electron** - Cross-platform framework
- **Electron Forge** - Complete toolchain
- **Vite** - Ultra-fast build tool
- **ESLint** - Code linting and quality

### Transpilation & Execution
- **TypeScript Compiler** - Official transpiler
- **Monaco TypeScript Worker** - IntelliSense
- **Sandbox Execution** - Secure execution
- **Auto-run Intelligence** - Complete code detection

## Project Structure

```
jsexec/
├── src/
│   ├── main.ts          # Electron main process
│   ├── renderer.ts      # Interface logic
│   ├── preload.ts       # Preload script
│   └── index.css        # Application styles
├── index.html           # Main HTML structure
├── package.json         # Dependencies and scripts
└── forge.config.ts      # Electron Forge configuration
```

## Contributing

Contributions are welcome! If you want to contribute:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is under the MIT License. See the `LICENSE` file for more details.

## Acknowledgments

- Inspired by [RunJS](https://runjs.app/) - The commercial playground reference
- Built with [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code editor
- Powered by [Electron](https://www.electronjs.org/) - Cross-platform framework
- [TypeScript](https://www.typescriptlang.org/) - Official transpiler integrated
- [Electron Forge](https://www.electronforge.io/) - Complete toolchain

---

<div align="center">
  
  ### Do you like JSExec?
  
  [![GitHub stars](https://img.shields.io/github/stars/FranciscoJBrito/JSExec?style=social)](https://github.com/FranciscoJBrito/JSExec/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/FranciscoJBrito/JSExec?style=social)](https://github.com/FranciscoJBrito/JSExec/network/members)
  
  **Give the repository a star!**
  
  ---
  
  ### Community
  
  **Found a bug?** → [Report an issue](https://github.com/FranciscoJBrito/JSExec/issues)
  
  **Have an idea?** → [Start a discussion](https://github.com/FranciscoJBrito/JSExec/discussions)
  
  **Want to contribute?** → [Contribution guide](https://github.com/FranciscoJBrito/JSExec/blob/main/CONTRIBUTING.md)
  ---
  
  ### Project Status
  
  ![GitHub release](https://img.shields.io/github/v/release/FranciscoJBrito/JSExec)
  ![GitHub last commit](https://img.shields.io/github/last-commit/FranciscoJBrito/JSExec)
  ![GitHub issues](https://img.shields.io/github/issues/FranciscoJBrito/JSExec)
  ![GitHub pull requests](https://img.shields.io/github/issues-pr/FranciscoJBrito/JSExec)
  
  **Made with love by [Francisco Brito](https://github.com/FranciscoJBrito)**
  
</div>
