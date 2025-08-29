'use client';

import { Block, BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Minus, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DividerBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function DividerBlock({
  block,
  isActive,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: DividerBlockProps) {
  const handleFocus = () => {
    onFocus();
  };

  return (
    <div 
      className={cn(
        'group relative flex items-center gap-2 py-4 cursor-pointer',
        isActive && 'bg-accent/5 rounded-md px-2 -mx-2'
      )}
      data-block-id={block.id}
      onClick={handleFocus}
    >
      {/* Block Handle */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onNewBlock('text');
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onConvert('divider')}>
              <Minus className="h-4 w-4 mr-2" />
              Divider
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

      {/* Divider Line */}
      <div className="flex-1">
        <Separator className="opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}