'use client';

import { useState, useEffect, useMemo } from 'react';
import { Page, SearchResult } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Hash } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pages: Page[];
  onPageSelect: (pageId: string) => void;
  searchPages: (query: string) => SearchResult[];
}

export function SearchDialog({
  open,
  onOpenChange,
  pages,
  onPageSelect,
  searchPages,
}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Get recent pages (mock implementation)
  const recentPages = useMemo(() => {
    return pages.slice(0, 5); // Show first 5 pages as recent
  }, [pages]);

  // Update search results when query changes
  useEffect(() => {
    if (query.trim()) {
      const results = searchPages(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [query, searchPages]);

  const handleSelect = (pageId: string) => {
    onPageSelect(pageId);
    onOpenChange(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Search pages</DialogTitle>
        </DialogHeader>
        
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Search pages and content..."
            value={query}
            onValueChange={setQuery}
            className="border-0 border-b rounded-none focus:ring-0"
          />
          
          <CommandList className="max-h-96">
            {!query.trim() && (
              <>
                {recentPages.length > 0 && (
                  <CommandGroup heading="Recent Pages">
                    {recentPages.map((page) => (
                      <CommandItem
                        key={page.id}
                        onSelect={() => handleSelect(page.id)}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{page.emoji || '📄'}</span>
                            <span className="font-medium truncate">{page.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {page.content.length} blocks • Updated {page.updatedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                <CommandGroup heading="Quick Actions">
                  <CommandItem className="flex items-center gap-3 py-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Create new page</div>
                      <div className="text-xs text-muted-foreground">Start writing immediately</div>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </>
            )}

            {query.trim() && (
              <>
                {searchResults.length === 0 ? (
                  <CommandEmpty className="py-6">
                    <div className="text-center space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No pages found for "{query}"
                      </p>
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup heading="Search Results">
                    {searchResults.map((result) => (
                      <CommandItem
                        key={`${result.pageId}-${result.blockId}`}
                        onSelect={() => handleSelect(result.pageId)}
                        className="flex items-start gap-3 py-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-muted flex-shrink-0 mt-0.5">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{pages.find(p => p.id === result.pageId)?.emoji || '📄'}</span>
                            <span className="font-medium truncate">{result.pageTitle}</span>
                            {result.matchCount > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {result.matchCount} matches
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {result.snippet}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>

          <div className="border-t p-3 text-xs text-muted-foreground bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>⎋ Close</span>
              </div>
              <div>
                {query.trim() && (
                  <span>{searchResults.length} results</span>
                )}
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}