'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcuts) {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.callback(event);
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcut configurations
export const EDITOR_SHORTCUTS = {
  BOLD: { key: 'b', ctrlKey: true, metaKey: true },
  ITALIC: { key: 'i', ctrlKey: true, metaKey: true },
  UNDERLINE: { key: 'u', ctrlKey: true, metaKey: true },
  CODE: { key: '`', ctrlKey: true, metaKey: true },
  SEARCH: { key: 'k', ctrlKey: true, metaKey: true },
  NEW_PAGE: { key: 'n', ctrlKey: true, metaKey: true },
  SAVE: { key: 's', ctrlKey: true, metaKey: true },
  UNDO: { key: 'z', ctrlKey: true, metaKey: true },
  REDO: { key: 'z', ctrlKey: true, metaKey: true, shiftKey: true },
};