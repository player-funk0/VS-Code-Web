import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function ContextMenu() {
  const { contextMenu, closeContextMenu } = useUIStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const { visible, x, y, items } = contextMenu;

  useEffect(() => {
    const handleClick = () => {
      closeContextMenu();
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (visible) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [visible, closeContextMenu]);

  // Adjust position if menu goes off screen
  const adjustedX = menuRef.current
    ? Math.min(x, window.innerWidth - menuRef.current.offsetWidth - 10)
    : x;
  const adjustedY = menuRef.current
    ? Math.min(y, window.innerHeight - menuRef.current.offsetHeight - 10)
    : y;

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#252526] border border-[#454545] shadow-lg z-[1500] py-1 min-w-[180px]"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) =>
        item.separator ? (
          <div key={index} className="my-1 border-t border-[#454545]" />
        ) : (
          <button
            key={index}
            className={`w-full text-left px-4 py-1.5 text-[13px] transition-colors ${
              item.disabled
                ? 'text-[#6e6e6e] cursor-not-allowed'
                : 'text-[#cccccc] hover:bg-[#04395e] cursor-pointer'
            }`}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                closeContextMenu();
              }
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
