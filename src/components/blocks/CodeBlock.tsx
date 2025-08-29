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
import { MoreHorizontal, Plus, Code, Type, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function CodeBlock({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: CodeBlockProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newValue);
      onUpdate({ content: newValue });
      
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    } else if (e.key === 'Enter' && e.metaKey) {
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

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
    }
  };

  return (
    <div 
      className={cn(
        'group relative rounded-lg border bg-muted/30 p-3',
        isActive && 'ring-2 ring-primary/20'
      )}
      data-block-id={block.id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Code</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>

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
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onConvert('code')}>
                <Code className="h-4 w-4 mr-2" />
                Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onConvert('text')}>
                <Type className="h-4 w-4 mr-2" />
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
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
      </div>

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="Write some code..."
        className="w-full resize-none border-0 bg-transparent p-0 font-mono text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
        style={{ minHeight: '2rem' }}
        rows={3}
      />
    </div>
  );
}