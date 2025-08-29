'use client';

import { BlockType } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered,
  CheckSquare,
  Minus,
  Quote,
  Code,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onAddBlock: (type: BlockType) => void;
  activeBlockId: string | null;
  className?: string;
}

const BLOCK_TYPES = [
  {
    type: 'text' as BlockType,
    label: 'Text',
    description: 'Just start writing with plain text.',
    icon: Type,
  },
  {
    type: 'heading1' as BlockType,
    label: 'Heading 1',
    description: 'Big section heading.',
    icon: Heading1,
  },
  {
    type: 'heading2' as BlockType,
    label: 'Heading 2',
    description: 'Medium section heading.',
    icon: Heading2,
  },
  {
    type: 'heading3' as BlockType,
    label: 'Heading 3',
    description: 'Small section heading.',
    icon: Heading3,
  },
  {
    type: 'bulletList' as BlockType,
    label: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    icon: List,
  },
  {
    type: 'numberedList' as BlockType,
    label: 'Numbered list',
    description: 'Create a list with numbering.',
    icon: ListOrdered,
  },
  {
    type: 'checkbox' as BlockType,
    label: 'To-do list',
    description: 'Track tasks with a to-do list.',
    icon: CheckSquare,
  },
  {
    type: 'quote' as BlockType,
    label: 'Quote',
    description: 'Capture a quote.',
    icon: Quote,
  },
  {
    type: 'code' as BlockType,
    label: 'Code',
    description: 'Capture a code snippet.',
    icon: Code,
  },
  {
    type: 'divider' as BlockType,
    label: 'Divider',
    description: 'Visually divide blocks.',
    icon: Minus,
  },
];

export function EditorToolbar({ onAddBlock, className }: EditorToolbarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {BLOCK_TYPES.map((blockType, index) => {
            const Icon = blockType.icon;
            return (
              <div key={blockType.type}>
                <DropdownMenuItem 
                  onClick={() => onAddBlock(blockType.type)}
                  className="flex items-start gap-3 py-3 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded bg-muted flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{blockType.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {blockType.description}
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < BLOCK_TYPES.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}