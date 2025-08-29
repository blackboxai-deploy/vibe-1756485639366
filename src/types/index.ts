// Core type definitions for Notion-like app

export interface Page {
  id: string;
  title: string;
  content: Block[];
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  children?: string[];
  isTemplate?: boolean;
  emoji?: string;
  coverImage?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperties;
  children?: Block[];
  createdAt: Date;
  updatedAt: Date;
}

export type BlockType = 
  | 'text'
  | 'heading1'
  | 'heading2' 
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'checkbox'
  | 'divider'
  | 'quote'
  | 'code';

export interface BlockProperties {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  checked?: boolean; // for checkbox blocks
  language?: string; // for code blocks
}

export interface WorkspaceState {
  pages: Page[];
  currentPageId: string | null;
  sidebarCollapsed: boolean;
  searchQuery: string;
  recentPages: string[];
}

export interface EditorState {
  blocks: Block[];
  activeBlockId: string | null;
  selection: EditorSelection | null;
  isEditing: boolean;
}

export interface EditorSelection {
  blockId: string;
  start: number;
  end: number;
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  blockId?: string;
  snippet: string;
  matchCount: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  blocks: Block[];
}

// Hook interfaces
export interface UsePageReturn {
  pages: Page[];
  currentPage: Page | null;
  createPage: (title?: string, parentId?: string) => Promise<Page>;
  deletePage: (pageId: string) => Promise<void>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  movePage: (pageId: string, newParentId?: string) => Promise<void>;
  setCurrentPage: (pageId: string) => void;
  searchPages: (query: string) => SearchResult[];
}

export interface UseEditorReturn {
  blocks: Block[];
  activeBlockId: string | null;
  addBlock: (type: BlockType, position?: number) => Block;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newPosition: number) => void;
  setActiveBlock: (blockId: string | null) => void;
  convertBlock: (blockId: string, newType: BlockType) => void;
}

// UI Component Props
export interface SidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onPageCreate: (parentId?: string) => void;
  onPageDelete: (pageId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface EditorProps {
  page: Page | null;
  onPageUpdate: (updates: Partial<Page>) => void;
  className?: string;
}

export interface BlockProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  isActive: boolean;
  onFocus: () => void;
}