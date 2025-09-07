<div align="center">
  <img src="build-asset/icon.png" alt="JSExec Logo" width="128" height="128">
  
  # JSExec
  
  **The Ultimate JavaScript & TypeScript Playground**
  
  *Open source alternative to RunJS - Completely free and powerful*
  
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
git clone https://github.com/franciscojavierbrito/jsexec.git
cd jsexec

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

## Code Examples

### Modern JavaScript

```javascript
// Welcome to JSExec!
console.log('Hello JSExec!');

// ES2020+ Features
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n ** 2);
console.log('Numbers:', numbers);
console.log('Squares:', squares);

// Async/Await
async function fetchData() {
  const data = await Promise.resolve('Data loaded!');
  console.log(data);
}

fetchData();

// Destructuring and Spread
const person = { name: 'Ana', age: 25, city: 'Madrid' };
const { name, ...rest } = person;
console.log(`${name} lives in ${rest.city}`);
```

### Advanced TypeScript

```typescript
// TypeScript with types and interfaces
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`User ${user.name} added`);
  }

  getActiveUsers(): User[] {
    return this.users.filter(u => u.active);
  }

  findByEmail<T extends User>(email: string): T | undefined {
    return this.users.find(u => u.email === email) as T;
  }
}

// Using the manager
const manager = new UserManager();

manager.addUser({
  id: 1,
  name: 'Francisco',
  email: 'francisco@jsexec.dev',
  active: true
});

const activeUsers = manager.getActiveUsers();
console.log('Active users:', activeUsers.length);
```

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

## Roadmap

### v1.0 - Completed
- [x] **TypeScript Support** - Official transpiler integrated
- [x] **Multiple Themes** - GitHub Dark + Tomorrow Night Bright
- [x] **Customizable Fonts** - 5 professional options
- [x] **Multi-language** - English & Spanish
- [x] **Complete IntelliSense** - Tooltips and autocompletion
- [x] **Smart Auto-run** - Complete code detection
- [x] **Security System** - Sandbox and timeouts
- [x] **Persistent Configuration** - localStorage

### v1.1 - Coming Soon
- [ ] **Multiple Tabs** - Complete workspace
- [ ] **Code Snippets** - Predefined templates
- [ ] **Export Results** - PDF, HTML, Markdown
- [ ] **Execution History** - Results cache

### v2.0 - Future
- [ ] **npm Integration** - Import external packages
- [ ] **Integrated Debugger** - Breakpoints and step-by-step
- [ ] **ES Modules Support** - Native import/export
- [ ] **Real-time Collaboration** - Shared workspaces
- [ ] **Plugin System** - Third-party extensions
- [ ] **Cloud Sync** - Cloud synchronization

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
  
  [![GitHub stars](https://img.shields.io/github/stars/franciscojavierbrito/jsexec?style=social)](https://github.com/franciscojavierbrito/jsexec/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/franciscojavierbrito/jsexec?style=social)](https://github.com/franciscojavierbrito/jsexec/network/members)
  
  **Give the repository a star!**
  
  ---
  
  ### Community
  
  **Found a bug?** → [Report an issue](https://github.com/franciscojavierbrito/jsexec/issues)
  
  **Have an idea?** → [Start a discussion](https://github.com/franciscojavierbrito/jsexec/discussions)
  
  **Want to contribute?** → [Contribution guide](https://github.com/franciscojavierbrito/jsexec/blob/main/CONTRIBUTING.md)
  
  **Direct contact** → [francisco@jsexec.dev](mailto:francisco@jsexec.dev)
  
  ---
  
  ### Project Status
  
  ![GitHub release](https://img.shields.io/github/v/release/franciscojavierbrito/jsexec)
  ![GitHub last commit](https://img.shields.io/github/last-commit/franciscojavierbrito/jsexec)
  ![GitHub issues](https://img.shields.io/github/issues/franciscojavierbrito/jsexec)
  ![GitHub pull requests](https://img.shields.io/github/issues-pr/franciscojavierbrito/jsexec)
  
  **Made with love by [Francisco Brito](https://github.com/franciscojavierbrito)**
  
</div>