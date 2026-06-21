import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import type { TerminalLine } from '@/types';
import { useFileStore } from './fileStore';

interface TerminalState {
  lines: TerminalLine[];
  currentDirectory: string;
  commandHistory: string[];
  historyIndex: number;
  isClaudeMode: boolean;

  initialize: () => Promise<void>;
  addLine: (line: TerminalLine) => void;
  executeCommand: (command: string) => void;
  handleClaudeCommand: (command: string) => void;
  streamText: (text: string, lineType?: TerminalLine['type'], delayMs?: number) => void;
  setCurrentDirectory: (dir: string) => void;
  setHistoryIndex: (index: number) => void;
  enterClaudeMode: () => void;
  exitClaudeMode: () => void;
  persistHistory: () => Promise<void>;
  clear: () => void;
}

const colorize = (text: string, color: string): string => {
  const colors: Record<string, string> = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    reset: '\x1b[0m',
    teal: '\x1b[38;5;79m',
  };
  return `${colors[color] || ''}${text}${colors.reset}`;
};

const resolvePath = (input: string, cwd: string): string => {
  if (input.startsWith('/')) return input;
  if (input.startsWith('~/')) return '/workspace' + input.slice(1);
  if (cwd === '/') return '/' + input;
  return cwd + '/' + input;
};

interface CommandResult {
  output: string;
  cwd?: string;
  error?: boolean;
}

type CommandHandler = (args: string[], cwd: string) => CommandResult;

const COMMANDS: Record<string, CommandHandler> = {
  help: () => ({
    output: `Available commands:
  ${colorize('ls', 'green')} [path]        List directory contents
  ${colorize('cd', 'green')} <path>        Change directory
  ${colorize('pwd', 'green')}              Print working directory
  ${colorize('cat', 'green')} <file>       Display file contents
  ${colorize('mkdir', 'green')} <name>     Create directory
  ${colorize('touch', 'green')} <name>     Create empty file
  ${colorize('rm', 'green')} <name>        Remove file or directory
  ${colorize('clear', 'green')}            Clear terminal
  ${colorize('echo', 'green')} <text>      Print text
  ${colorize('git', 'green')} <cmd>        Git commands (status, log)
  ${colorize('npm', 'green')} --version    Show npm version
  ${colorize('node', 'green')} --version   Show node version
  ${colorize('claude', 'cyan')}            Enter Claude Code REPL
  ${colorize('whoami', 'green')}           Show current user
  ${colorize('date', 'green')}             Show current date
  ${colorize('uname', 'green')}            Show system info
  ${colorize('history', 'green')}          Show command history
  ${colorize('help', 'green')}             Show this help message`,
  }),

  ls: (args, cwd) => {
    const targetPath = args[0] ? resolvePath(args[0], cwd) : cwd;
    const items = useFileStore.getState().listDirectory(targetPath);
    if (items.length === 0) {
      return { output: colorize('(empty directory)', 'gray') };
    }
    const output = items.map((item) => {
      if (item.type === 'directory') {
        return colorize(`${item.name}/`, 'blue');
      }
      const ext = item.name.split('.').pop() || '';
      const execExts = ['sh', 'bash', 'zsh', 'exe'];
      if (execExts.includes(ext)) return colorize(item.name, 'green');
      if (['json', 'md', 'txt', 'yml', 'yaml'].includes(ext)) return colorize(item.name, 'cyan');
      return item.name;
    }).join('  ');
    return { output };
  },

  cd: (args, cwd) => {
    if (!args[0] || args[0] === '~') {
      return { output: '', cwd: '/workspace' };
    }
    if (args[0] === '..') {
      const parent = cwd.substring(0, cwd.lastIndexOf('/'));
      return { output: '', cwd: parent || '/workspace' };
    }
    if (args[0] === '-') {
      return { output: '', cwd };
    }
    const targetPath = resolvePath(args[0], cwd);
    const dir = useFileStore.getState().getFile(targetPath);
    if (!dir || dir.type !== 'directory') {
      return { output: colorize(`cd: no such directory: ${args[0]}`, 'red'), error: true };
    }
    return { output: '', cwd: targetPath };
  },

  pwd: (_, cwd) => ({ output: cwd }),

  cat: (args, cwd) => {
    if (!args[0]) {
      return { output: colorize('cat: missing file operand', 'red'), error: true };
    }
    const filePath = resolvePath(args[0], cwd);
    const file = useFileStore.getState().getFile(filePath);
    if (!file || file.type === 'directory') {
      return { output: colorize(`cat: ${args[0]}: No such file`, 'red'), error: true };
    }
    return { output: file.content || '' };
  },

  mkdir: (args, cwd) => {
    if (!args[0]) {
      return { output: colorize('mkdir: missing operand', 'red'), error: true };
    }
    useFileStore.getState().createDirectory(cwd, args[0]);
    return { output: '' };
  },

  touch: (args, cwd) => {
    if (!args[0]) {
      return { output: colorize('touch: missing file operand', 'red'), error: true };
    }
    useFileStore.getState().createFile(cwd, args[0]);
    return { output: '' };
  },

  rm: (args, cwd) => {
    if (!args[0]) {
      return { output: colorize('rm: missing operand', 'red'), error: true };
    }
    const recursive = args.includes('-r') || args.includes('-rf');
    const target = args.filter((a) => !a.startsWith('-'))[0];
    if (!target) {
      return { output: colorize('rm: missing operand', 'red'), error: true };
    }
    const filePath = resolvePath(target, cwd);
    const fileStore = useFileStore.getState();
    const file = fileStore.getFile(filePath);
    if (!file) {
      return { output: colorize(`rm: cannot remove '${target}': No such file`, 'red'), error: true };
    }
    if (file.type === 'directory' && !recursive) {
      return { output: colorize(`rm: cannot remove '${target}': Is a directory`, 'red'), error: true };
    }
    fileStore.deleteFile(filePath);
    return { output: '' };
  },

  clear: () => ({ output: '__CLEAR__' }),

  echo: (args) => ({ output: args.join(' ') }),

  git: (args) => {
    const subcmd = args[0];
    if (subcmd === 'status') {
      return {
        output: `${colorize('On branch', 'green')} main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  ${colorize('modified:', 'red')}   src/components/App.tsx
  ${colorize('modified:', 'red')}   src/styles/global.css

Untracked files:
  ${colorize('src/hooks/useDebounce.ts', 'red')}

no changes added to commit`,
      };
    }
    if (subcmd === 'log') {
      return {
        output: `${colorize('commit a1b2c3d', 'yellow')} (HEAD -> main, origin/main)
Author: Developer <dev@example.com>
Date:   Mon Jan 15 10:30:00 2026

    Initial project setup

${colorize('commit e4f5g6h', 'yellow')}
Author: Developer <dev@example.com>
Date:   Mon Jan 15 09:15:00 2026

    Add base configuration`,
      };
    }
    return { output: colorize(`git: '${subcmd}' is not a supported git command.`, 'red'), error: true };
  },

  npm: () => ({ output: '10.2.4' }),

  node: () => ({ output: 'v20.11.0' }),

  whoami: () => ({ output: 'developer' }),

  date: () => ({ output: new Date().toString() }),

  uname: () => ({ output: 'Linux vscode-web 5.15.0-generic #1 SMP x86_64 GNU/Linux' }),

  history: () => {
    return { output: 'Use arrow keys (up/down) to navigate command history' };
  },
};

// Claude Code REPL simulation
interface ClaudeTask {
  description: string;
  execute: (args: string[]) => { thinking: string; tools: { name: string; params: string }[]; response: string };
}

const CLAUDE_COMMANDS: Record<string, ClaudeTask> = {
  analyze: {
    description: 'Analyze code or a topic',
    execute: (args) => ({
      thinking: 'I\'ll analyze this by reading the relevant files and then providing insights.',
      tools: [
        { name: 'read_file', params: `path="${args[0] || 'src/components/App.tsx'}"` },
        { name: 'thinking', params: 'thought="Analyzing the code structure and patterns..."' },
        { name: 'write_file', params: 'path="analysis.md" content="## Analysis\n\nThe code shows good separation of concerns..."' },
      ],
      response: `## Analysis Results

I've analyzed ${args[0] || 'the codebase'}. Here are my findings:

1. **Architecture**: The project follows a clean component-based architecture with proper separation of concerns.

2. **Code Quality**: The TypeScript usage is solid with proper type definitions throughout.

3. **Areas for Improvement**:
   - Consider adding error boundaries for better error handling
   - The state management could benefit from some normalization
   - Add more comprehensive unit tests

4. **Recommendations**: 
   - Use React.memo for frequently rendered components
   - Implement proper loading states and skeleton screens

I've written a detailed analysis to \`analysis.md\` for your review.`,
    }),
  },
  refactor: {
    description: 'Refactor code',
    execute: (args) => ({
      thinking: 'Let me read the file first, then plan the refactoring steps.',
      tools: [
        { name: 'read_file', params: `path="${args[0] || 'src/components/Header.tsx'}"` },
        { name: 'thinking', params: 'thought="Planning refactoring steps..."' },
        { name: 'edit_file', params: 'old_string="const Header" new_string="const Header: React.FC<HeaderProps>"' },
      ],
      response: `## Refactoring Complete

I've refactored ${args[0] || 'the file'} with the following changes:

1. **Extracted interfaces** into separate type definitions
2. **Added proper type annotations** to all function parameters
3. **Simplified conditional rendering** using early returns
4. **Memoized callbacks** with useCallback where appropriate

The refactored code is now more maintainable and type-safe.`,
    }),
  },
  test: {
    description: 'Run or generate tests',
    execute: (args) => ({
      thinking: 'Let me find the test files and run the test suite.',
      tools: [
        { name: 'glob', params: 'pattern="**/*.test.{ts,tsx}"' },
        { name: 'read_file', params: 'path="src/components/App.test.tsx"' },
        { name: 'terminal', params: 'command="npm test"' },
      ],
      response: `## Test Results

Running tests for ${args[0] || 'all modules'}...

\x1b[32m✓\x1b[0m App component renders without errors (45ms)
\x1b[32m✓\x1b[0m Sidebar toggles visibility correctly (12ms)
\x1b[32m✓\x1b[0m File tree expands and collapses (8ms)
\x1b[32m✓\x1b[0m Editor updates on tab change (23ms)
\x1b[31m✗\x1b[0m Terminal processes commands correctly (expected "hello", got "")

**4 passed, 1 failed** (88ms total)

The failing test needs attention - the terminal command output doesn't match expectations.`,
    }),
  },
  review: {
    description: 'Code review',
    execute: () => ({
      thinking: 'Reading all source files to provide a comprehensive review.',
      tools: [
        { name: 'read_file', params: 'path="src/components/App.tsx"' },
        { name: 'read_file', params: 'path="src/components/Sidebar.tsx"' },
        { name: 'read_file', params: 'path="src/hooks/useFileSystem.ts"' },
        { name: 'thinking', params: 'thought="Compiling review notes..."' },
      ],
      response: `## Code Review

### Overall Assessment: \x1b[33mNeeds Work\x1b[0m

**Strengths:**
- Clean component structure
- Good use of TypeScript
- Proper hook abstraction

**Issues Found:**
1. **Missing error handling** in async operations (App.tsx:12)
2. **Unused imports** should be removed (Sidebar.tsx:1)
3. **Magic strings** should be extracted to constants
4. **Missing key props** in list rendering (useFileSystem.ts)

**Recommendations:**
- Add try/catch blocks for all async operations
- Use React.StrictMode to catch potential issues
- Consider using a state management library for complex data flows

Would you like me to address any of these issues?`,
    }),
  },
  explain: {
    description: 'Explain a concept',
    execute: (args) => ({
      thinking: `The user wants to understand ${args[0] || 'React hooks'}. Let me provide a clear explanation.`,
      tools: [
        { name: 'thinking', params: 'thought="Structuring the explanation..."' },
      ],
      response: `## ${args[0] || 'React Hooks'} Explained

**What are ${args[0] || 'React Hooks'}?**

${args[0] || 'React Hooks'} are functions that let you use state and other React features in functional components. They were introduced in React 16.8.

**Key Concepts:**

1. **useState** - Adds state to functional components:
\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`

2. **useEffect** - Handles side effects:
\`\`\`tsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

3. **useContext** - Consumes context values:
\`\`\`tsx
const theme = useContext(ThemeContext);
\`\`\`

**Best Practices:**
- Only call hooks at the top level
- Only call hooks from React functions
- Use the exhaustive-deps ESLint rule

Would you like me to dive deeper into any specific hook?`,
    }),
  },
};

export const useTerminalStore = create<TerminalState>((setState, getState) => ({
  lines: [
    { type: 'system', content: 'Welcome to VS Code: Web Terminal', timestamp: Date.now() },
    { type: 'system', content: 'Type \'help\' for available commands, or \'claude\' to enter Claude Code REPL', timestamp: Date.now() },
  ],
  currentDirectory: '/workspace',
  commandHistory: [],
  historyIndex: -1,
  isClaudeMode: false,

  initialize: async () => {
    try {
      const saved = await get<string[]>('terminal-history');
      if (saved) {
        setState({ commandHistory: saved.slice(-500) });
      }
    } catch {
      // ignore
    }
  },

  addLine: (line: TerminalLine) => {
    const state = getState();
    const newLines = [...state.lines, line].slice(-1000);
    setState({ lines: newLines });
  },

  executeCommand: (command: string) => {
    const state = getState();
    const trimmed = command.trim();
    
    if (!trimmed) return;

    // Add to history
    const newHistory = [...state.commandHistory, trimmed].slice(-500);
    setState({ commandHistory: newHistory, historyIndex: -1 });
    getState().persistHistory();

    // Add input line
    const prompt = getState().isClaudeMode ? 'claude > ' : `user@vscode:${state.currentDirectory.replace('/workspace', '~')}$ `;
    getState().addLine({ type: 'input', content: prompt + trimmed, timestamp: Date.now() });

    // Handle claude mode
    if (state.isClaudeMode) {
      getState().handleClaudeCommand(trimmed);
      return;
    }

    // Handle entering claude mode
    if (trimmed === 'claude') {
      getState().enterClaudeMode();
      return;
    }

    // Parse command
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd](args, state.currentDirectory);
      if (result.cwd && result.cwd !== state.currentDirectory) {
        setState({ currentDirectory: result.cwd });
      }
      if (result.output === '__CLEAR__') {
        setState({ lines: [] });
      } else if (result.output) {
        getState().addLine({
          type: result.error ? 'error' : 'output',
          content: result.output,
          timestamp: Date.now(),
        });
      }
    } else {
      getState().addLine({
        type: 'error',
        content: colorize(`Command not found: ${cmd}. Type 'help' for available commands.`, 'red'),
        timestamp: Date.now(),
      });
    }
  },

  handleClaudeCommand: (command: string) => {
    // Slash commands
    if (command === '/help') {
      const helpText = `Claude Code REPL Commands:
  ${colorize('/help', 'cyan')}     Show this help message
  ${colorize('/clear', 'cyan')}    Clear REPL history
  ${colorize('/exit', 'cyan')}     Exit Claude REPL

Available tasks:
  ${colorize('analyze', 'teal')} [topic]    Analyze code or topic
  ${colorize('refactor', 'teal')} [file]    Refactor code
  ${colorize('test', 'teal')} [module]      Run or generate tests
  ${colorize('review', 'teal')}             Code review
  ${colorize('explain', 'teal')} [concept]  Explain a concept`;
      getState().addLine({ type: 'ai', content: helpText, timestamp: Date.now() });
      return;
    }
    
    if (command === '/clear') {
      setState({ lines: [] });
      return;
    }
    
    if (command === '/exit') {
      getState().exitClaudeMode();
      return;
    }

    // Handle task commands
    const parts = command.split(/\s+/);
    const taskCmd = parts[0];
    const args = parts.slice(1);

    if (CLAUDE_COMMANDS[taskCmd]) {
      const task = CLAUDE_COMMANDS[taskCmd];
      const result = task.execute(args);

      // Show thinking
      if (result.thinking) {
        getState().streamText('Thinking: ' + result.thinking, 'ai', 15);
      }

      // Show tool calls with delay
      setTimeout(() => {
        result.tools.forEach((tool, index) => {
          setTimeout(() => {
            getState().addLine({
              type: 'tool',
              content: `${colorize('▸', 'teal')} ${colorize(tool.name, 'teal')}(${tool.params})`,
              timestamp: Date.now(),
            });
          }, index * 600);
        });

        // Show response after tools
        setTimeout(() => {
          getState().streamText(result.response, 'ai', 12);
        }, result.tools.length * 600 + 300);
      }, 500);
    } else {
      getState().streamText(
        `I don't recognize that command. Type ${colorize('/help', 'cyan')} to see available commands, or describe what you'd like me to do.`,
        'ai',
        12
      );
    }
  },

  streamText: (text: string, type: TerminalLine['type'] = 'ai', delayMs: number = 15) => {
    const chars = text.split('');
    let currentText = '';
    
    const streamLine: TerminalLine = {
      type,
      content: '',
      timestamp: Date.now(),
    };
    
    getState().addLine(streamLine);
    const lines = getState().lines;
    const lineIndex = lines.length - 1;

    chars.forEach((char, index) => {
      setTimeout(() => {
        currentText += char;
        const allLines = [...getState().lines];
        if (allLines[lineIndex]) {
          allLines[lineIndex] = { ...allLines[lineIndex], content: currentText };
          setState({ lines: allLines });
        }
      }, index * delayMs);
    });
  },

  setCurrentDirectory: (dir: string) => setState({ currentDirectory: dir }),
  setHistoryIndex: (index: number) => setState({ historyIndex: index }),

  enterClaudeMode: () => {
    setState({ isClaudeMode: true });
    getState().addLine({
      type: 'system',
      content: `${colorize('?', 'cyan')} Entering Claude Code REPL mode.`,
      timestamp: Date.now(),
    });
    getState().addLine({
      type: 'ai',
      content: `Hello! I'm Claude, your AI coding assistant. I can help you with:

  • Analyzing code and architecture
  • Refactoring and optimization
  • Writing and running tests
  • Code reviews
  • Explaining concepts

Type ${colorize('/help', 'cyan')} for available commands, or ${colorize('/exit', 'cyan')} to leave.
What would you like to work on?`,
      timestamp: Date.now(),
    });
  },

  exitClaudeMode: () => {
    setState({ isClaudeMode: false });
    getState().addLine({
      type: 'system',
      content: 'Exited Claude Code REPL.',
      timestamp: Date.now(),
    });
  },

  persistHistory: async () => {
    await set('terminal-history', getState().commandHistory);
  },

  clear: () => setState({ lines: [] }),
}));
