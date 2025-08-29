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
import { MoreHorizontal, Plus, Type, Heading1, Heading2, List, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function TextBlock({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: TextBlockProps) {
  const [content, setContent] = useState(block.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

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
    } else if (e.key === '/' && content === '') {
      // Slash command - convert to different block types
      e.preventDefault();
      // This would open a command menu in a real implementation
    }
  };

  const handleFocus = () => {
    onFocus();
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
            <DropdownMenuItem onClick={() => onConvert('text')}>
              <Type className="h-4 w-4 mr-2" />
              Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('heading1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('heading2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('bulletList')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('checkbox')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Checkbox
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
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Type '/' for commands, or start writing..."
          className="w-full resize-none border-0 bg-transparent p-0 text-base focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
          style={{ minHeight: '1.5rem' }}
          rows={1}
        />
      </div>
    </div>
  );
}