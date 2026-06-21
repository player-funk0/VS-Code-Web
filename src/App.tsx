import { useEffect, useCallback } from 'react';
import { ActivityBar } from '@/components/ActivityBar';
import { Sidebar } from '@/components/Sidebar';
import { EditorArea } from '@/components/EditorArea';
import { Panel } from '@/components/Panel';
import { StatusBar } from '@/components/StatusBar';
import { MenuBar } from '@/components/MenuBar';
import { CommandPalette } from '@/components/CommandPalette';
import { ContextMenu } from '@/components/ContextMenu';
import { useUIStore } from '@/stores/uiStore';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import { useTerminalStore } from '@/stores/terminalStore';

function App() {
  const { 
    sidebarVisible, 
    sidebarWidth, 
    panelVisible, 
    panelHeight, 
    toggleSidebar, 
    togglePanel, 
    openCommandPalette,
    setSidebarWidth,
    setPanelHeight,
  } = useUIStore();
  
  const initializeFiles = useFileStore(s => s.initialize);
  const initializeTabs = useEditorStore(s => s.initialize);
  const initializeTerminal = useTerminalStore(s => s.initialize);

  useEffect(() => {
    initializeFiles();
    initializeTabs();
    initializeTerminal();
  }, [initializeFiles, initializeTabs, initializeTerminal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            toggleSidebar();
            break;
          case '`':
            e.preventDefault();
            togglePanel();
            break;
          case 'p':
            if (e.shiftKey) {
              e.preventDefault();
              openCommandPalette();
            }
            break;
          case 's':
            e.preventDefault();
            {
              const activePath = useEditorStore.getState().activeTabPath;
              if (activePath) {
                const content = useFileStore.getState().getFileContent(activePath);
                useFileStore.getState().writeFile(activePath, content);
                useEditorStore.getState().markSaved(activePath);
              }
            }
            break;
          case 'w':
            e.preventDefault();
            {
              const activePath = useEditorStore.getState().activeTabPath;
              if (activePath) {
                useEditorStore.getState().closeTab(activePath);
              }
            }
            break;
          case 'n':
            e.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, togglePanel, openCommandPalette]);

  // Sidebar resize handler
  const handleSidebarResize = useCallback((e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth, setSidebarWidth]);

  // Panel resize handler
  const handlePanelResize = useCallback((e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = panelHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight - (moveEvent.clientY - startY);
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [panelHeight, setPanelHeight]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#cccccc] select-none">
      {/* Menu Bar */}
      <MenuBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar />

        {/* Sidebar */}
        {sidebarVisible && (
          <>
            <div
              className="flex-shrink-0 overflow-hidden"
              style={{ width: sidebarWidth }}
            >
              <Sidebar />
            </div>
            {/* Sidebar resize handle */}
            <div
              className="w-1 flex-shrink-0 cursor-col-resize hover:bg-[#007acc] transition-colors"
              style={{ marginLeft: -2, zIndex: 10 }}
              onMouseDown={handleSidebarResize}
            />
          </>
        )}

        {/* Center: Editor + Panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Editor Area */}
          <div className="flex-1 min-h-0">
            <EditorArea />
          </div>

          {/* Panel */}
          {panelVisible && (
            <>
              {/* Panel resize handle */}
              <div
                className="h-1 flex-shrink-0 cursor-row-resize hover:bg-[#007acc] transition-colors"
                style={{ marginTop: -2, zIndex: 10 }}
                onMouseDown={handlePanelResize}
              />
              <div
                className="flex-shrink-0 overflow-hidden"
                style={{ height: panelHeight }}
              >
                <Panel />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandPalette />
      <ContextMenu />
    </div>
  );
}

export default App;
