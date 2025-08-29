'use client';

import { useState, useCallback } from 'react';
import { Page } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Copy,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onPageCreate: (parentId?: string) => void;
  onPageDelete: (pageId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface PageItemProps {
  page: Page;
  level: number;
  isActive: boolean;
  onSelect: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  onCreateChild: (parentId?: string) => void;
  children: Page[];
}

function PageItem({ 
  page, 
  level, 
  isActive, 
  onSelect, 
  onDelete, 
  onCreateChild,
  children 
}: PageItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors',
          isActive && 'bg-accent text-accent-foreground',
          'text-sm'
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-accent-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => onSelect(page.id)}
        >
          <span className="text-base">{page.emoji || '📄'}</span>
          <span className="truncate">{page.title}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent-foreground/10"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onCreateChild(page.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Add sub-page
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(page.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Render children if expanded */}
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              isActive={false}
              onSelect={onSelect}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              children={[]} // For now, we'll only show one level of nesting
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  pages,
  currentPageId,
  onPageSelect,
  onPageCreate,
  onPageDelete,
  collapsed,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const rootPages = pages.filter(page => !page.parentId);
  const filteredPages = searchQuery
    ? rootPages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rootPages;

  const getChildPages = useCallback((parentId: string): Page[] => {
    return pages.filter(page => page.parentId === parentId);
  }, [pages]);

  if (collapsed) {
    return null;
  }

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">Workspace</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageCreate()}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-8 bg-background"
        />
      </div>

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {filteredPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto opacity-50" />
                  <p className="text-sm">No pages found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileText className="h-8 w-8 mx-auto opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm">No pages yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageCreate()}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create first page
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            filteredPages.map((page) => (
              <PageItem
                key={page.id}
                page={page}
                level={0}
                isActive={currentPageId === page.id}
                onSelect={onPageSelect}
                onDelete={onPageDelete}
                onCreateChild={onPageCreate}
                children={getChildPages(page.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t pt-3 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>{pages.length} pages</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}