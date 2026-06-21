import { create } from 'zustand';
import { get, set, del } from 'idb-keyval';
import type { FileNode } from '@/types';
import { initialFiles, getLanguageFromPath } from '@/data/initialFiles';

interface FileState {
  files: FileNode[];
  expandedPaths: Set<string>;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  persistFiles: (files: FileNode[]) => Promise<void>;
  getFile: (path: string) => FileNode | undefined;
  getFileContent: (path: string) => string;
  updateFileContent: (path: string, content: string) => void;
  toggleDirectory: (path: string) => void;
  createFile: (parentPath: string, name: string) => Promise<void>;
  createDirectory: (parentPath: string, name: string) => Promise<void>;
  renameFile: (path: string, newName: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  listDirectory: (path: string) => FileNode[];
  readFile: (path: string) => string;
  writeFile: (path: string, content: string) => Promise<void>;
  fileExists: (path: string) => boolean;
}

const flattenFiles = (files: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  const traverse = (nodes: FileNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(files);
  return result;
};

const findNode = (files: FileNode[], path: string): FileNode | undefined => {
  return flattenFiles(files).find(f => f.path === path);
};

const addNodeToTree = (files: FileNode[], parentPath: string, newNode: FileNode): FileNode[] => {
  return files.map(file => {
    if (file.path === parentPath && file.type === 'directory') {
      return {
        ...file,
        isOpen: true,
        children: [...(file.children || []), newNode].sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
      };
    }
    if (file.children) {
      return { ...file, children: addNodeToTree(file.children, parentPath, newNode) };
    }
    return file;
  });
};

const removeNodeFromTree = (files: FileNode[], path: string): FileNode[] => {
  return files
    .filter(f => f.path !== path)
    .map(file => {
      if (file.children) {
        return { ...file, children: removeNodeFromTree(file.children, path) };
      }
      return file;
    });
};

const renameNodeInTree = (files: FileNode[], oldPath: string, newName: string): FileNode[] => {
  const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;
  return files.map(file => {
    if (file.path === oldPath) {
      return {
        ...file,
        name: newName,
        path: newPath,
        children: file.children?.map(child => ({
          ...child,
          path: child.path.replace(oldPath, newPath),
        })),
      };
    }
    if (file.children) {
      return { ...file, children: renameNodeInTree(file.children, oldPath, newName) };
    }
    return file;
  });
};

const toggleNodeInTree = (files: FileNode[], path: string): FileNode[] => {
  return files.map(file => {
    if (file.path === path && file.type === 'directory') {
      return { ...file, isOpen: !file.isOpen };
    }
    if (file.children) {
      return { ...file, children: toggleNodeInTree(file.children, path) };
    }
    return file;
  });
};

const updateNodeContent = (files: FileNode[], path: string, content: string): FileNode[] => {
  return files.map(file => {
    if (file.path === path) {
      return { ...file, content, isDirty: true };
    }
    if (file.children) {
      return { ...file, children: updateNodeContent(file.children, path, content) };
    }
    return file;
  });
};

export const useFileStore = create<FileState>((setState, getState) => ({
  files: initialFiles,
  expandedPaths: new Set(['/workspace', '/workspace/src']),
  initialized: false,

  initialize: async () => {
    try {
      const saved = await get<FileNode[]>('vscode-files');
      if (saved && saved.length > 0) {
        setState({ files: saved, initialized: true });
      } else {
        await set('vscode-files', initialFiles);
        setState({ files: initialFiles, initialized: true });
      }
    } catch {
      setState({ files: initialFiles, initialized: true });
    }
  },

  persistFiles: async (files: FileNode[]) => {
    await set('vscode-files', files);
  },

  getFile: (path: string) => {
    return findNode(getState().files, path);
  },

  getFileContent: (path: string) => {
    const file = findNode(getState().files, path);
    return file?.content || '';
  },

  updateFileContent: (path: string, content: string) => {
    const newFiles = updateNodeContent(getState().files, path, content);
    setState({ files: newFiles });
    getState().persistFiles(newFiles);
  },

  toggleDirectory: (path: string) => {
    const newFiles = toggleNodeInTree(getState().files, path);
    const newPaths = new Set(getState().expandedPaths);
    if (newPaths.has(path)) {
      newPaths.delete(path);
    } else {
      newPaths.add(path);
    }
    setState({ files: newFiles, expandedPaths: newPaths });
    getState().persistFiles(newFiles);
  },

  createFile: async (parentPath: string, name: string) => {
    const newNode: FileNode = {
      name,
      path: `${parentPath}/${name}`,
      type: 'file',
      language: getLanguageFromPath(name),
      content: '',
    };
    const newFiles = addNodeToTree(getState().files, parentPath, newNode);
    setState({ files: newFiles });
    await getState().persistFiles(newFiles);
  },

  createDirectory: async (parentPath: string, name: string) => {
    const newNode: FileNode = {
      name,
      path: `${parentPath}/${name}`,
      type: 'directory',
      isOpen: false,
      children: [],
    };
    const newFiles = addNodeToTree(getState().files, parentPath, newNode);
    setState({ files: newFiles });
    await getState().persistFiles(newFiles);
  },

  renameFile: async (path: string, newName: string) => {
    const newFiles = renameNodeInTree(getState().files, path, newName);
    setState({ files: newFiles });
    await getState().persistFiles(newFiles);
  },

  deleteFile: async (path: string) => {
    const newFiles = removeNodeFromTree(getState().files, path);
    setState({ files: newFiles });
    await getState().persistFiles(newFiles);
    await del(`file-${path}`);
  },

  listDirectory: (path: string) => {
    const dir = findNode(getState().files, path);
    return dir?.children || [];
  },

  readFile: (path: string) => {
    const file = findNode(getState().files, path);
    return file?.content || '';
  },

  writeFile: async (path: string, content: string) => {
    const exists = findNode(getState().files, path);
    if (exists) {
      const newFiles = updateNodeContent(getState().files, path, content);
      // Mark as not dirty when explicitly saved
      const markSaved = (files: FileNode[]): FileNode[] =>
        files.map(f => {
          if (f.path === path) return { ...f, isDirty: false };
          if (f.children) return { ...f, children: markSaved(f.children) };
          return f;
        });
      const savedFiles = markSaved(newFiles);
      setState({ files: savedFiles });
      await getState().persistFiles(savedFiles);
    } else {
      const parentPath = path.substring(0, path.lastIndexOf('/'));
      const name = path.substring(path.lastIndexOf('/') + 1);
      await getState().createFile(parentPath, name);
      await getState().writeFile(path, content);
    }
  },

  fileExists: (path: string) => {
    return !!findNode(getState().files, path);
  },
}));
