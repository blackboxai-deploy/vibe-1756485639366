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
import { MoreHorizontal, Plus, Heading1, Heading2, Heading3, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function HeadingBlock({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: HeadingBlockProps) {
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
      onNewBlock('text');
    } else if (e.key === 'Backspace' && content === '' && !e.shiftKey) {
      e.preventDefault();
      onDelete();
    }
  };

  const handleFocus = () => {
    onFocus();
  };

  const getHeadingStyles = () => {
    switch (block.type) {
      case 'heading1':
        return 'text-3xl font-bold';
      case 'heading2':
        return 'text-2xl font-semibold';
      case 'heading3':
        return 'text-xl font-semibold';
      default:
        return 'text-3xl font-bold';
    }
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading1':
        return 'Heading 1';
      case 'heading2':
        return 'Heading 2';
      case 'heading3':
        return 'Heading 3';
      default:
        return 'Heading';
    }
  };

  return (
    <div 
      className={cn(
        'group relative flex items-start gap-2 py-2',
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
          onClick={() => onNewBlock('text')}
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
            <DropdownMenuItem onClick={() => onConvert('heading1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('heading2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('heading3')}>
              <Heading3 className="h-4 w-4 mr-2" />
              Heading 3
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
          className={cn(
            'w-full border-0 bg-transparent p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60',
            getHeadingStyles()
          )}
        />
      </div>
    </div>
  );
}