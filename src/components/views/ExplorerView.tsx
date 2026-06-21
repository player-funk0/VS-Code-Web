import { useState, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
  FileText,
  FileJson,
  FileType2,
  Trash2,
  Pencil,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import type { FileNode } from '@/types';

const FILE_ICONS: Record<string, { icon: any; color: string }> = {
  tsx: { icon: FileCode, color: '#519aba' },
  ts: { icon: FileCode, color: '#519aba' },
  js: { icon: FileCode, color: '#f1e05a' },
  jsx: { icon: FileCode, color: '#f1e05a' },
  css: { icon: FileType2, color: '#563d7c' },
  scss: { icon: FileType2, color: '#c6538c' },
  html: { icon: FileCode, color: '#e34c26' },
  json: { icon: FileJson, color: '#f1e05a' },
  md: { icon: FileText, color: '#519aba' },
  default: { icon: FileText, color: '#cccccc' },
};

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function TreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const { toggleDirectory, deleteFile, createFile, createDirectory, renameFile } = useFileStore();
  const { openPreviewFile, openFile } = useEditorStore();
  const { openContextMenu, addNotification } = useUIStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback(() => {
    if (node.type === 'directory') {
      toggleDirectory(node.path);
    }
  }, [node.type, node.path, toggleDirectory]);

  const handleClick = useCallback(() => {
    if (node.type === 'file') {
      openPreviewFile(node.path, node.name);
    } else {
      handleToggle();
    }
  }, [node.type, node.path, node.name, openPreviewFile, handleToggle]);

  const handleDoubleClick = useCallback(() => {
    if (node.type === 'file') {
      openFile(node.path, node.name);
    }
  }, [node.type, node.path, node.name, openFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (node.type === 'directory') {
      openContextMenu(e.clientX, e.clientY, [
        {
          label: 'New File',
          action: () => {
            setIsCreatingFile(true);
            setNewItemName('');
            setTimeout(() => inputRef.current?.focus(), 50);
          },
        },
        {
          label: 'New Folder',
          action: () => {
            setIsCreatingFolder(true);
            setNewItemName('');
            setTimeout(() => inputRef.current?.focus(), 50);
          },
        },
        { label: '', separator: true, action: () => {} },
        {
          label: 'Rename',
          action: () => {
            setIsRenaming(true);
            setRenameValue(node.name);
            setTimeout(() => inputRef.current?.focus(), 50);
          },
        },
        {
          label: 'Delete',
          action: () => {
            deleteFile(node.path);
            addNotification(`Deleted ${node.name}`, 'success');
          },
        },
      ]);
    } else {
      openContextMenu(e.clientX, e.clientY, [
        {
          label: 'Open',
          action: () => openFile(node.path, node.name),
        },
        {
          label: 'Rename',
          action: () => {
            setIsRenaming(true);
            setRenameValue(node.name);
            setTimeout(() => inputRef.current?.focus(), 50);
          },
        },
        { label: '', separator: true, action: () => {} },
        {
          label: 'Delete',
          action: () => {
            deleteFile(node.path);
            addNotification(`Deleted ${node.name}`, 'success');
          },
        },
      ]);
    }
  }, [node, openContextMenu, openFile, deleteFile, addNotification]);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      renameFile(node.path, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleCreateSubmit = () => {
    if (!newItemName.trim()) {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      return;
    }
    if (isCreatingFile) {
      createFile(node.path, newItemName.trim());
      addNotification(`Created ${newItemName}`, 'success');
    } else if (isCreatingFolder) {
      createDirectory(node.path, newItemName.trim());
      addNotification(`Created ${newItemName}/`, 'success');
    }
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    setNewItemName('');
  };

  const paddingLeft = depth * 8 + 8;
  const { icon: IconComponent, color } = node.type === 'file'
    ? getFileIcon(node.name)
    : { icon: null, color: '' };

  return (
    <div>
      <div
        className="flex items-center h-[22px] px-2 cursor-pointer hover:bg-[#2a2d2e] text-[13px] group"
        style={{ paddingLeft }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Expand/Collapse arrow */}
        <div className="w-4 h-4 flex items-center justify-center mr-0.5 flex-shrink-0">
          {node.type === 'directory' && (
            node.isOpen ? (
              <ChevronDown size={14} className="text-[#cccccc]" />
            ) : (
              <ChevronRight size={14} className="text-[#cccccc]" />
            )
          )}
        </div>

        {/* Icon */}
        <div className="w-4 h-4 flex items-center justify-center mr-1.5 flex-shrink-0">
          {node.type === 'directory' ? (
            node.isOpen ? (
              <FolderOpen size={16} className="text-[#dcb67a]" />
            ) : (
              <Folder size={16} className="text-[#dcb67a]" />
            )
          ) : (
            IconComponent && <IconComponent size={16} style={{ color }} />
          )}
        </div>

        {/* Name */}
        {isRenaming ? (
          <input
            ref={inputRef}
            className="flex-1 min-w-0 bg-[#3c3c3c] text-[#cccccc] outline-none px-1 text-[13px]"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="truncate text-[#cccccc]">{node.name}</span>
        )}

        {/* Hover actions */}
        {!isRenaming && (
          <div className="ml-auto hidden group-hover:flex items-center gap-0.5">
            {node.type === 'directory' && (
              <>
                <button
                  className="w-5 h-5 flex items-center justify-center hover:bg-[#3c3c3c] rounded"
                  title="New File"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingFile(true);
                    setNewItemName('');
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                >
                  <Plus size={12} className="text-[#858585]" />
                </button>
                <button
                  className="w-5 h-5 flex items-center justify-center hover:bg-[#3c3c3c] rounded"
                  title="New Folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingFolder(true);
                    setNewItemName('');
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                >
                  <FolderPlus size={12} className="text-[#858585]" />
                </button>
              </>
            )}
            <button
              className="w-5 h-5 flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              title="Rename"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setRenameValue(node.name);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              <Pencil size={10} className="text-[#858585]" />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(node.path);
                addNotification(`Deleted ${node.name}`, 'success');
              }}
            >
              <Trash2 size={10} className="text-[#858585]" />
            </button>
          </div>
        )}
      </div>

      {/* New item input */}
      {(isCreatingFile || isCreatingFolder) && (
        <div
          className="flex items-center h-[22px] px-2"
          style={{ paddingLeft: paddingLeft + 20 }}
        >
          {isCreatingFolder ? (
            <Folder size={16} className="text-[#dcb67a] mr-1.5" />
          ) : (
            <FileText size={16} className="text-[#cccccc] mr-1.5" />
          )}
          <input
            ref={inputRef}
            className="flex-1 bg-[#3c3c3c] text-[#cccccc] outline-none px-1 text-[13px]"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit();
              if (e.key === 'Escape') {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
            placeholder={isCreatingFolder ? 'Folder name' : 'File name'}
            autoFocus
          />
        </div>
      )}

      {/* Children */}
      {node.type === 'directory' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExplorerView() {
  const { files } = useFileStore();

  // Open workspace folder
  const openFolder = () => {
    // In a real app, this would open a file picker
    // For now, we just notify
    useUIStore.getState().addNotification('Open folder dialog', 'info');
  };

  if (files.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[#858585] text-[13px] mb-4">You have not yet opened a folder.</p>
        <button
          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-3 py-1.5 text-[13px] transition-colors"
          onClick={openFolder}
        >
          Open Folder
        </button>
      </div>
    );
  }

  return (
    <div className="py-1">
      {files.map((node) => (
        <TreeItem key={node.path} node={node} depth={0} />
      ))}
    </div>
  );
}
