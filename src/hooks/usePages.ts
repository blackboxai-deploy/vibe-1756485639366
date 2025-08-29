'use client';

import { useState, useEffect, useCallback } from 'react';
import { Page, SearchResult } from '@/types';
import { StorageManager } from '@/lib/storage';
import { PageManager } from '@/lib/pageUtils';

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load pages from storage on mount
  useEffect(() => {
    const loadData = () => {
      const storedPages = StorageManager.loadPages();
      const workspace = StorageManager.loadWorkspaceState();
      
      setPages(storedPages);
      setCurrentPageId(workspace.currentPageId);
      setLoading(false);
    };

    loadData();
  }, []);

  // Save workspace state when current page changes
  useEffect(() => {
    if (!loading) {
      StorageManager.saveWorkspaceState({ currentPageId });
    }
  }, [currentPageId, loading]);

  const refreshPages = useCallback(() => {
    const updatedPages = StorageManager.loadPages();
    setPages(updatedPages);
  }, []);

  const createPage = useCallback(async (title?: string, parentId?: string): Promise<Page> => {
    const newPage = PageManager.createPage(title, parentId);
    refreshPages();
    setCurrentPageId(newPage.id);
    return newPage;
  }, [refreshPages]);

  const updatePage = useCallback(async (pageId: string, updates: Partial<Page>): Promise<void> => {
    PageManager.updatePage(pageId, updates);
    refreshPages();
  }, [refreshPages]);

  const deletePage = useCallback(async (pageId: string): Promise<void> => {
    PageManager.deletePage(pageId);
    refreshPages();
    
    // If we deleted the current page, navigate to the first available page
    if (currentPageId === pageId) {
      const remainingPages = StorageManager.loadPages();
      setCurrentPageId(remainingPages.length > 0 ? remainingPages[0].id : null);
    }
  }, [currentPageId, refreshPages]);

  const movePage = useCallback(async (pageId: string, newParentId?: string): Promise<void> => {
    PageManager.movePage(pageId, newParentId);
    refreshPages();
  }, [refreshPages]);

  const duplicatePage = useCallback(async (pageId: string): Promise<Page | null> => {
    const duplicated = PageManager.duplicatePage(pageId);
    if (duplicated) {
      refreshPages();
      setCurrentPageId(duplicated.id);
    }
    return duplicated;
  }, [refreshPages]);

  const searchPages = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];
    
    const results = StorageManager.searchContent(query);
    return results.map(result => ({
      pageId: result.page.id,
      pageTitle: result.page.title,
      blockId: result.matches[0]?.blockId,
      snippet: result.matches[0]?.snippet || '',
      matchCount: result.matches.length,
    }));
  }, []);

  const setCurrentPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
    StorageManager.addToRecentPages(pageId);
  }, []);

  const getCurrentPage = useCallback((): Page | null => {
    if (!currentPageId) return null;
    return pages.find(p => p.id === currentPageId) || null;
  }, [currentPageId, pages]);

  const getPageHierarchy = useCallback(() => {
    return PageManager.getPageHierarchy();
  }, []);

  const getRecentPages = useCallback((): Page[] => {
    const workspace = StorageManager.loadWorkspaceState();
    return workspace.recentPages
      .map(id => pages.find(p => p.id === id))
      .filter((page): page is Page => page !== undefined)
      .slice(0, 5);
  }, [pages]);

  return {
    pages,
    currentPage: getCurrentPage(),
    currentPageId,
    loading,
    createPage,
    updatePage,
    deletePage,
    movePage,
    duplicatePage,
    searchPages,
    setCurrentPage,
    refreshPages,
    getPageHierarchy,
    getRecentPages,
  };
}