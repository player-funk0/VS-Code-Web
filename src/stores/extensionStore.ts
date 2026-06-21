import { create } from 'zustand';
import type { Extension } from '@/types';

interface ExtensionState {
  extensions: Extension[];
  searchQuery: string;
  selectedExtension: Extension | null;

  setSearchQuery: (q: string) => void;
  setSelectedExtension: (ext: Extension | null) => void;
  toggleExtension: (id: string) => void;
  getInstalled: () => Extension[];
  getPopular: () => Extension[];
  getFiltered: () => Extension[];
}

const DEFAULT_EXTENSIONS: Extension[] = [
  {
    id: 'es7-react-js-snippets',
    name: 'ES7+ React/Redux/React-Native snippets',
    publisher: 'dsznajder',
    version: '4.4.3',
    description: 'Extensions for React, React-Native and Redux in JS/TS with ES7+ syntax. Customizable. Built-in integration with prettier.',
    installed: true,
    enabled: true,
    downloads: 22000000,
    rating: 4.8,
    categories: ['Snippets', 'React'],
  },
  {
    id: 'prettier-vscode',
    name: 'Prettier - Code: formatter',
    publisher: 'Prettier',
    version: '10.1.0',
    description: 'Code: formatter using prettier',
    installed: true,
    enabled: true,
    downloads: 35000000,
    rating: 4.6,
    categories: ['Formatters'],
  },
  {
    id: 'eslint',
    name: 'ESLint',
    publisher: 'Microsoft',
    version: '2.4.4',
    description: 'Integrates ESLint JavaScript',
    installed: true,
    enabled: true,
    downloads: 28000000,
    rating: 4.5,
    categories: ['Linters'],
  },
  {
    id: 'gitlens',
    name: 'GitLens — Git supercharged',
    publisher: 'GitKraken',
    version: '14.8.0',
    description: 'Supercharge Git within VS Code: — Visualize code: authorship at a glance via Git blame annotations and CodeLens.',
    installed: false,
    enabled: false,
    downloads: 25000000,
    rating: 4.9,
    categories: ['SCM Providers', 'Visualization'],
  },
  {
    id: 'typescript-next',
    name: 'JavaScript and TypeScript Nightly',
    publisher: 'Microsoft',
    version: '5.4.0',
    description: 'Enables TypeScript 5.4 plus nightly builds',
    installed: false,
    enabled: false,
    downloads: 1200000,
    rating: 4.7,
    categories: ['Programming Languages'],
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS IntelliSense',
    publisher: 'Tailwind Labs',
    version: '0.10.0',
    description: 'Intelligent Tailwind CSS tooling for VS Code:',
    installed: false,
    enabled: false,
    downloads: 8000000,
    rating: 4.8,
    categories: ['Visualization', 'Programming Languages'],
  },
  {
    id: 'docker',
    name: 'Docker',
    publisher: 'Microsoft',
    version: '1.29.0',
    description: 'Makes it easy to create, manage, and debug containerized applications.',
    installed: true,
    enabled: false,
    downloads: 19000000,
    rating: 4.4,
    categories: ['Debuggers', 'Visualization'],
  },
  {
    id: 'python',
    name: 'Python',
    publisher: 'Microsoft',
    version: '2024.0.1',
    description: 'IntelliSense, Linting, Debugging in VS Code:.',
    installed: false,
    enabled: false,
    downloads: 95000000,
    rating: 4.7,
    categories: ['Programming Languages', 'Debuggers', 'Linters'],
  },
  {
    id: 'rust-analyzer',
    name: 'rust-analyzer',
    publisher: 'The Rust Programming Language',
    version: '0.3.1800',
    description: 'Rust language support for Visual Studio Code:.',
    installed: false,
    enabled: false,
    downloads: 2500000,
    rating: 4.9,
    categories: ['Programming Languages'],
  },
  {
    id: 'go',
    name: 'Go',
    publisher: 'Google',
    version: '0.40.0',
    description: 'Rich Go language support for Visual Studio Code:.',
    installed: false,
    enabled: false,
    downloads: 12000000,
    rating: 4.6,
    categories: ['Programming Languages', 'Debuggers'],
  },
  {
    id: 'vscode-icons',
    name: 'vscode-icons',
    publisher: 'VSCode: Icons Team',
    version: '12.6.0',
    description: 'Icons for Visual Studio Code:.',
    installed: true,
    enabled: true,
    downloads: 32000000,
    rating: 4.9,
    categories: ['Themes'],
  },
  {
    id: 'material-theme',
    name: 'Material Icon Theme',
    publisher: 'Philipp Kief',
    version: '4.32.0',
    description: 'Material Design Icons for Visual Studio Code:.',
    installed: false,
    enabled: false,
    downloads: 27000000,
    rating: 4.9,
    categories: ['Themes'],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    publisher: 'GitHub',
    version: '1.156.0',
    description: 'Your AI pair programmer',
    installed: false,
    enabled: false,
    downloads: 5000000,
    rating: 4.5,
    categories: ['Machine Learning', 'Snippets'],
  },
  {
    id: 'yaml',
    name: 'YAML',
    publisher: 'Red Hat',
    version: '1.14.0',
    description: 'YAML Language Support with built-in Kubernetes syntax support',
    installed: false,
    enabled: false,
    downloads: 15000000,
    rating: 4.4,
    categories: ['Programming Languages'],
  },
  {
    id: 'markdown-all-in-one',
    name: 'Markdown All in One',
    publisher: 'Yu Zhang',
    version: '3.6.0',
    description: 'All you need for Markdown (keyboard shortcuts, table of contents, auto preview and more)',
    installed: true,
    enabled: true,
    downloads: 6000000,
    rating: 4.7,
    categories: ['Programming Languages', 'Visualization'],
  },
];

export const useExtensionStore = create<ExtensionState>((setState, getState) => ({
  extensions: DEFAULT_EXTENSIONS,
  searchQuery: '',
  selectedExtension: null,

  setSearchQuery: (q: string) => setState({ searchQuery: q }),
  setSelectedExtension: (ext: Extension | null) => setState({ selectedExtension: ext }),

  toggleExtension: (id: string) => {
    const newExts = getState().extensions.map(e =>
      e.id === id ? { ...e, installed: !e.installed, enabled: !e.enabled } : e
    );
    setState({ extensions: newExts });
  },

  getInstalled: () => getState().extensions.filter(e => e.installed),
  getPopular: () => getState().extensions.filter(e => !e.installed).sort((a, b) => (b.downloads || 0) - (a.downloads || 0)),
  getFiltered: () => {
    const q = getState().searchQuery.toLowerCase();
    if (!q) return getState().extensions;
    return getState().extensions.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.publisher.toLowerCase().includes(q) ||
        e.categories?.some(c => c.toLowerCase().includes(q))
    );
  },
}));
