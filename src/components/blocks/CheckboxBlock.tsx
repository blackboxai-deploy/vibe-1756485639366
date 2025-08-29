'use client';

import { useState, useRef, useEffect } from 'react';
import { Block, BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, CheckSquare, Type, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function CheckboxBlock({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: CheckboxBlockProps) {
  const [content, setContent] = useState(block.content);
  const [checked, setChecked] = useState(block.properties?.checked || false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(block.content);
    setChecked(block.properties?.checked || false);
  }, [block.content, block.properties?.checked]);

  const handleContentChange = (value: string) => {
    setContent(value);
    onUpdate({ content: value });
  };

  const handleCheckedChange = (newChecked: boolean) => {
    setChecked(newChecked);
    onUpdate({ 
      properties: { 
        ...block.properties, 
        checked: newChecked 
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        onNewBlock('checkbox');
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
          onClick={() => onNewBlock('checkbox')}
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
            <DropdownMenuItem onClick={() => onConvert('checkbox')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Checkbox
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConvert('bulletList')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
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

      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-4 h-4"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="To-do item"
          className={cn(
            'w-full border-0 bg-transparent p-0 text-base focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60',
            checked && 'line-through text-muted-foreground'
          )}
        />
      </div>
    </div>
  );
}