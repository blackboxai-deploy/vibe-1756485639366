'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePages } from '@/hooks/usePages';
import { useKeyboardShortcuts, EDITOR_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Sidebar } from './Sidebar';
import { Editor } from './Editor';
import { SearchDialog } from './SearchDialog';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotionApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    pages,
    currentPage,
    currentPageId,
    loading,
    createPage,
    updatePage,
    deletePage,
    setCurrentPage,
    searchPages,
  } = usePages();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...EDITOR_SHORTCUTS.SEARCH,
      callback: () => setSearchOpen(true),
      description: 'Open search',
    },
    {
      ...EDITOR_SHORTCUTS.NEW_PAGE,
      callback: () => createPage(),
      description: 'Create new page',
    },
  ]);

  const handlePageSelect = useCallback((pageId: string) => {
    setCurrentPage(pageId);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [setCurrentPage, isMobile]);

  const handlePageCreate = useCallback(async (parentId?: string) => {
    await createPage(undefined, parentId);
  }, [createPage]);

  const handlePageDelete = useCallback(async (pageId: string) => {
    await deletePage(pageId);
  }, [deletePage]);

  const handlePageUpdate = useCallback(async (updates: any) => {
    if (currentPageId) {
      await updatePage(currentPageId, updates);
    }
  }, [currentPageId, updatePage]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r bg-muted/20 transition-all duration-200 ease-in-out flex flex-col',
          sidebarCollapsed
            ? 'w-0 overflow-hidden'
            : 'w-64 md:w-72'
        )}
      >
        <Sidebar
          pages={pages}
          currentPageId={currentPageId}
          onPageSelect={handlePageSelect}
          onPageCreate={handlePageCreate}
          onPageDelete={handlePageDelete}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="flex-shrink-0"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="justify-start text-muted-foreground max-w-xs"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => createPage()}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">New Page</span>
          </Button>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          {currentPage ? (
            <Editor
              page={currentPage}
              onPageUpdate={handlePageUpdate}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-md mx-auto p-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-12 h-12 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-foreground">Welcome to your workspace</h2>
                  <p className="text-muted-foreground">
                    Create your first page to get started with organizing your thoughts and ideas.
                  </p>
                </div>
                <Button onClick={() => createPage()} className="inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first page
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        pages={pages}
        onPageSelect={handlePageSelect}
        searchPages={searchPages}
      />
    </div>
  );
}