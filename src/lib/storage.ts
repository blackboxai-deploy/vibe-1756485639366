// Local storage utilities for data persistence

import { Page, WorkspaceState } from '@/types';

const STORAGE_KEYS = {
  PAGES: 'notion-app-pages',
  WORKSPACE: 'notion-app-workspace',
  SETTINGS: 'notion-app-settings',
} as const;

export class StorageManager {
  // Page management
  static savePages(pages: Page[]): void {
    try {
      const serializedPages = pages.map(page => ({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
        content: page.content.map(block => ({
          ...block,
          createdAt: block.createdAt.toISOString(),
          updatedAt: block.updatedAt.toISOString(),
        })),
      }));
      localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(serializedPages));
    } catch (error) {
      console.error('Failed to save pages:', error);
    }
  }

  static loadPages(): Page[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PAGES);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt),
        content: page.content.map((block: any) => ({
          ...block,
          createdAt: new Date(block.createdAt),
          updatedAt: new Date(block.updatedAt),
        })),
      }));
    } catch (error) {
      console.error('Failed to load pages:', error);
      return [];
    }
  }

  // Workspace state management
  static saveWorkspaceState(state: Partial<WorkspaceState>): void {
    try {
      const current = this.loadWorkspaceState();
      const updated = { ...current, ...state };
      localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save workspace state:', error);
    }
  }

  static loadWorkspaceState(): WorkspaceState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      if (!stored) {
        return {
          pages: [],
          currentPageId: null,
          sidebarCollapsed: false,
          searchQuery: '',
          recentPages: [],
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load workspace state:', error);
      return {
        pages: [],
        currentPageId: null,
        sidebarCollapsed: false,
        searchQuery: '',
        recentPages: [],
      };
    }
  }

  // Backup and restore
  static exportData(): string {
    const pages = this.loadPages();
    const workspace = this.loadWorkspaceState();
    
    return JSON.stringify({
      pages,
      workspace,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.pages && Array.isArray(data.pages)) {
        const pages = data.pages.map((page: any) => ({
          ...page,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt),
          content: page.content.map((block: any) => ({
            ...block,
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt),
          })),
        }));
        this.savePages(pages);
      }

      if (data.workspace) {
        this.saveWorkspaceState(data.workspace);
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Search functionality
  static searchContent(query: string): Array<{ page: Page; matches: Array<{ blockId: string; snippet: string }> }> {
    const pages = this.loadPages();
    const results: Array<{ page: Page; matches: Array<{ blockId: string; snippet: string }> }> = [];

    if (!query.trim()) return results;

    const searchTerm = query.toLowerCase();

    pages.forEach(page => {
      const matches: Array<{ blockId: string; snippet: string }> = [];

      // Search page title
      if (page.title.toLowerCase().includes(searchTerm)) {
        matches.push({
          blockId: 'title',
          snippet: page.title,
        });
      }

      // Search block content
      page.content.forEach(block => {
        if (block.content.toLowerCase().includes(searchTerm)) {
          const index = block.content.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, index - 30);
          const end = Math.min(block.content.length, index + query.length + 30);
          const snippet = block.content.substring(start, end);
          
          matches.push({
            blockId: block.id,
            snippet: start > 0 ? '...' + snippet : snippet,
          });
        }
      });

      if (matches.length > 0) {
        results.push({ page, matches });
      }
    });

    return results;
  }

  // Recent pages tracking
  static addToRecentPages(pageId: string): void {
    const workspace = this.loadWorkspaceState();
    const recentPages = workspace.recentPages.filter(id => id !== pageId);
    recentPages.unshift(pageId);
    
    this.saveWorkspaceState({
      ...workspace,
      recentPages: recentPages.slice(0, 10), // Keep only 10 recent pages
    });
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}