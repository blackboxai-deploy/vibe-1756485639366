// Page management utilities

import { Page, Block, BlockType } from '@/types';
import { StorageManager } from './storage';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createDefaultBlock(type: BlockType = 'text', content: string = ''): Block {
  const now = new Date();
  return {
    id: generateId(),
    type,
    content,
    createdAt: now,
    updatedAt: now,
    properties: type === 'checkbox' ? { checked: false } : {},
  };
}

export function createDefaultPage(title: string = 'Untitled', parentId?: string): Page {
  const now = new Date();
  const page: Page = {
    id: generateId(),
    title,
    content: [createDefaultBlock('text', '')],
    createdAt: now,
    updatedAt: now,
    parentId,
    children: [],
  };
  return page;
}

export class PageManager {
  static createPage(title?: string, parentId?: string): Page {
    const pages = StorageManager.loadPages();
    const newPage = createDefaultPage(title || `Untitled ${pages.length + 1}`, parentId);
    
    // Update parent page to include this child
    if (parentId) {
      const parentPage = pages.find(p => p.id === parentId);
      if (parentPage) {
        parentPage.children = parentPage.children || [];
        parentPage.children.push(newPage.id);
        parentPage.updatedAt = new Date();
      }
    }
    
    pages.push(newPage);
    StorageManager.savePages(pages);
    StorageManager.addToRecentPages(newPage.id);
    
    return newPage;
  }

  static updatePage(pageId: string, updates: Partial<Page>): Page | null {
    const pages = StorageManager.loadPages();
    const pageIndex = pages.findIndex(p => p.id === pageId);
    
    if (pageIndex === -1) return null;
    
    pages[pageIndex] = {
      ...pages[pageIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    StorageManager.savePages(pages);
    StorageManager.addToRecentPages(pageId);
    
    return pages[pageIndex];
  }

  static deletePage(pageId: string): boolean {
    const pages = StorageManager.loadPages();
    const pageToDelete = pages.find(p => p.id === pageId);
    
    if (!pageToDelete) return false;
    
    // Remove from parent's children
    if (pageToDelete.parentId) {
      const parentPage = pages.find(p => p.id === pageToDelete.parentId);
      if (parentPage?.children) {
        parentPage.children = parentPage.children.filter(id => id !== pageId);
        parentPage.updatedAt = new Date();
      }
    }
    
    // Recursively delete child pages
    const deleteRecursively = (id: string) => {
      const page = pages.find(p => p.id === id);
      if (page?.children) {
        page.children.forEach(deleteRecursively);
      }
      const index = pages.findIndex(p => p.id === id);
      if (index !== -1) {
        pages.splice(index, 1);
      }
    };
    
    deleteRecursively(pageId);
    StorageManager.savePages(pages);
    
    return true;
  }

  static movePage(pageId: string, newParentId?: string): boolean {
    const pages = StorageManager.loadPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) return false;
    
    // Remove from old parent
    if (page.parentId) {
      const oldParent = pages.find(p => p.id === page.parentId);
      if (oldParent?.children) {
        oldParent.children = oldParent.children.filter(id => id !== pageId);
        oldParent.updatedAt = new Date();
      }
    }
    
    // Add to new parent
    if (newParentId) {
      const newParent = pages.find(p => p.id === newParentId);
      if (newParent) {
        newParent.children = newParent.children || [];
        newParent.children.push(pageId);
        newParent.updatedAt = new Date();
      }
    }
    
    // Update page
    page.parentId = newParentId;
    page.updatedAt = new Date();
    
    StorageManager.savePages(pages);
    return true;
  }

  static getPageById(pageId: string): Page | null {
    const pages = StorageManager.loadPages();
    return pages.find(p => p.id === pageId) || null;
  }

  static getPagesByParent(parentId?: string): Page[] {
    const pages = StorageManager.loadPages();
    return pages.filter(p => p.parentId === parentId);
  }

  static getPageHierarchy(): Page[] {
    const pages = StorageManager.loadPages();
    
    // Build a map for quick lookup
    const pageMap = new Map<string, Page>();
    pages.forEach(page => pageMap.set(page.id, page));
    
    // Get root pages (no parent)
    const rootPages = pages.filter(p => !p.parentId);
    
    // Sort by creation date
    rootPages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return rootPages;
  }

  static duplicatePage(pageId: string): Page | null {
    const originalPage = this.getPageById(pageId);
    if (!originalPage) return null;
    
    const duplicatedPage: Page = {
      ...originalPage,
      id: generateId(),
      title: `${originalPage.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      content: originalPage.content.map(block => ({
        ...block,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };
    
    const pages = StorageManager.loadPages();
    pages.push(duplicatedPage);
    StorageManager.savePages(pages);
    
    return duplicatedPage;
  }
}

// Block utilities
export class BlockManager {
  static createBlock(type: BlockType, content: string = ''): Block {
    return createDefaultBlock(type, content);
  }

  static updateBlockInPage(pageId: string, blockId: string, updates: Partial<Block>): boolean {
    const page = PageManager.getPageById(pageId);
    if (!page) return false;
    
    const blockIndex = page.content.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;
    
    page.content[blockIndex] = {
      ...page.content[blockIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    return PageManager.updatePage(pageId, { content: page.content }) !== null;
  }

  static addBlockToPage(pageId: string, block: Block, position?: number): boolean {
    const page = PageManager.getPageById(pageId);
    if (!page) return false;
    
    if (position !== undefined && position >= 0 && position <= page.content.length) {
      page.content.splice(position, 0, block);
    } else {
      page.content.push(block);
    }
    
    return PageManager.updatePage(pageId, { content: page.content }) !== null;
  }

  static removeBlockFromPage(pageId: string, blockId: string): boolean {
    const page = PageManager.getPageById(pageId);
    if (!page) return false;
    
    const newContent = page.content.filter(b => b.id !== blockId);
    if (newContent.length === page.content.length) return false; // Block not found
    
    return PageManager.updatePage(pageId, { content: newContent }) !== null;
  }

  static moveBlockInPage(pageId: string, blockId: string, newPosition: number): boolean {
    const page = PageManager.getPageById(pageId);
    if (!page) return false;
    
    const blockIndex = page.content.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;
    
    const [block] = page.content.splice(blockIndex, 1);
    page.content.splice(newPosition, 0, block);
    
    return PageManager.updatePage(pageId, { content: page.content }) !== null;
  }
}

// Template utilities
export const DEFAULT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with an empty page',
    emoji: '📄',
    blocks: [createDefaultBlock('text', '')],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for meeting notes',
    emoji: '📋',
    blocks: [
      createDefaultBlock('heading1', 'Meeting Notes'),
      createDefaultBlock('text', '📅 Date: '),
      createDefaultBlock('text', '👥 Attendees: '),
      createDefaultBlock('heading2', 'Agenda'),
      createDefaultBlock('bulletList', ''),
      createDefaultBlock('heading2', 'Action Items'),
      createDefaultBlock('checkbox', ''),
    ],
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Template for project planning',
    emoji: '🚀',
    blocks: [
      createDefaultBlock('heading1', 'Project Plan'),
      createDefaultBlock('heading2', 'Overview'),
      createDefaultBlock('text', ''),
      createDefaultBlock('heading2', 'Goals'),
      createDefaultBlock('bulletList', ''),
      createDefaultBlock('heading2', 'Timeline'),
      createDefaultBlock('text', ''),
      createDefaultBlock('heading2', 'Tasks'),
      createDefaultBlock('checkbox', ''),
    ],
  },
];