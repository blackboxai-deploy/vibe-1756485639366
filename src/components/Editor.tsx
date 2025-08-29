'use client';

import { useState, useCallback, useEffect } from 'react';
import { Page, Block, BlockType } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { createDefaultBlock } from '@/lib/pageUtils';
import { BlockRenderer } from './Editor/BlockRenderer';
import { EditorToolbar } from './Editor/EditorToolbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface EditorProps {
  page: Page | null;
  onPageUpdate: (updates: Partial<Page>) => void;
  className?: string;
}

export function Editor({ page, onPageUpdate, className }: EditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  // Debounced auto-save for title
  const debouncedTitle = useDebounce(titleValue, 300);

  useEffect(() => {
    if (page && titleValue !== page.title && debouncedTitle) {
      onPageUpdate({ title: debouncedTitle });
    }
  }, [debouncedTitle, onPageUpdate, page, titleValue]);

  useEffect(() => {
    if (page) {
      setTitleValue(page.title);
    }
  }, [page]);

  const handleBlockUpdate = useCallback((blockId: string, updates: Partial<Block>) => {
    if (!page) return;

    const updatedBlocks = page.content.map(block =>
      block.id === blockId
        ? { ...block, ...updates, updatedAt: new Date() }
        : block
    );

    onPageUpdate({ content: updatedBlocks });
  }, [page, onPageUpdate]);

  const handleBlockDelete = useCallback((blockId: string) => {
    if (!page) return;

    const blockIndex = page.content.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const updatedBlocks = page.content.filter(b => b.id !== blockId);
    onPageUpdate({ content: updatedBlocks });

    // Focus previous block or create new one if this was the last
    if (blockIndex > 0) {
      const prevBlock = page.content[blockIndex - 1];
      setActiveBlockId(prevBlock.id);
    } else if (updatedBlocks.length === 0) {
      handleAddBlock('text', 0);
    } else {
      setActiveBlockId(updatedBlocks[0].id);
    }
  }, [page, onPageUpdate]);

  const handleAddBlock = useCallback((type: BlockType, position?: number) => {
    if (!page) return;

    const newBlock = createDefaultBlock(type);
    const updatedBlocks = [...page.content];
    
    if (position !== undefined) {
      updatedBlocks.splice(position, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }

    onPageUpdate({ content: updatedBlocks });
    setActiveBlockId(newBlock.id);

    // Focus the new block
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${newBlock.id}"]`);
      if (element) {
        const input = element.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        input?.focus();
      }
    }, 50);
  }, [page, onPageUpdate]);

  const handleNewBlockAfter = useCallback((currentBlockId: string, type: BlockType = 'text') => {
    if (!page) return;

    const currentIndex = page.content.findIndex(b => b.id === currentBlockId);
    if (currentIndex === -1) return;

    handleAddBlock(type, currentIndex + 1);
  }, [page, handleAddBlock]);

  const handleBlockConvert = useCallback((blockId: string, newType: BlockType) => {
    if (!page) return;

    const block = page.content.find(b => b.id === blockId);
    if (!block) return;

    // Preserve content but change type and reset properties
    const updatedProperties = newType === 'checkbox' ? { checked: false } : {};
    
    handleBlockUpdate(blockId, {
      type: newType,
      properties: updatedProperties,
    });
  }, [page, handleBlockUpdate]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTitle(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (page) {
      onPageUpdate({ emoji });
    }
  };

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <div className="text-lg">No page selected</div>
          <div className="text-sm">Select a page from the sidebar to start editing</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-6 pb-32">
          {/* Page Header */}
          <div className="space-y-4 mb-8">
            {/* Emoji and Title */}
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiSelect('📄')}
                className="text-4xl p-1 h-auto hover:bg-accent/50"
              >
                <span>{page.emoji || '📄'}</span>
              </Button>
              
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <form onSubmit={handleTitleSubmit}>
                    <Input
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      className="text-4xl font-bold border-0 px-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="Untitled"
                      autoFocus
                    />
                  </form>
                ) : (
                  <h1
                    className="text-4xl font-bold cursor-text hover:bg-accent/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {page.title || 'Untitled'}
                  </h1>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-muted-foreground pl-12">
              <span>Last edited {page.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Editor Toolbar */}
          <EditorToolbar
            onAddBlock={handleAddBlock}
            activeBlockId={activeBlockId}
            className="mb-4"
          />

          {/* Blocks */}
          <div className="space-y-2">
            {page.content.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                isActive={activeBlockId === block.id}
                onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                onDelete={() => handleBlockDelete(block.id)}
                onNewBlock={(type) => handleNewBlockAfter(block.id, type)}
                onFocus={() => setActiveBlockId(block.id)}
                onConvert={(newType) => handleBlockConvert(block.id, newType)}
              />
            ))}

            {/* Add block button */}
            {page.content.length === 0 && (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Button
                  variant="ghost"
                  onClick={() => handleAddBlock('text')}
                  className="justify-start text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Click to add content
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}