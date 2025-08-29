'use client';

import { useState, useRef, useEffect } from 'react';
import { Block, BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, List, ListOrdered, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function ListBlock({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: ListBlockProps) {
  const [content, setContent] = useState(block.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  const handleChange = (value: string) => {
    setContent(value);
    onUpdate({ content: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onNewBlock(block.type);
      } else {
        onNewBlock('text');
      }
    } else if (e.key === 'Backspace' && content === '' && !e.shiftKey) {
      e.preventDefault();
      onDelete();
    }
  };

  const handleFocus = () => {
    onFocus();
  };

  const getBulletIcon = () => {
    return block.type === 'numberedList' ? '1.' : '•';
  };

  const getPlaceholder = () => {
    return block.type === 'numberedList' ? 'Numbered list item' : 'List item';
  };

  return (
    <div 
      className={cn(
        'group relative flex items-start gap-2 py-1',
        isActive && 'bg-accent/5 rounded-md px-2 -mx-2'
      )}
      data-block-id={block.id}
    >
      {/* Block Handle */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => onNewBlock(block.type)}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onConvert('bulletList')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('numberedList')}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('text')}>
              <Type className="h-4 w-4 mr-2" />
              Text
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* List Bullet/Number */}
      <div className="flex-shrink-0 w-6 flex justify-center text-muted-foreground mt-0.5">
        <span className="text-sm font-medium">{getBulletIcon()}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={getPlaceholder()}
          className="w-full border-0 bg-transparent p-0 text-base focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}