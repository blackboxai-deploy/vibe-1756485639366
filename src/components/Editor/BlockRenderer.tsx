'use client';

import { Block, BlockType } from '@/types';
import { TextBlock } from '../blocks/TextBlock';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ListBlock } from '../blocks/ListBlock';
import { CheckboxBlock } from '../blocks/CheckboxBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { QuoteBlock } from '../blocks/QuoteBlock';
import { CodeBlock } from '../blocks/CodeBlock';

interface BlockRendererProps {
  block: Block;
  isActive: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onNewBlock: (type: BlockType) => void;
  onFocus: () => void;
  onConvert: (newType: BlockType) => void;
}

export function BlockRenderer({
  block,
  isActive,
  onUpdate,
  onDelete,
  onNewBlock,
  onFocus,
  onConvert,
}: BlockRendererProps) {
  const commonProps = {
    block,
    isActive,
    onUpdate,
    onDelete,
    onNewBlock,
    onFocus,
    onConvert,
  };

  switch (block.type) {
    case 'text':
      return <TextBlock {...commonProps} />;
    
    case 'heading1':
    case 'heading2':
    case 'heading3':
      return <HeadingBlock {...commonProps} />;
    
    case 'bulletList':
    case 'numberedList':
      return <ListBlock {...commonProps} />;
    
    case 'checkbox':
      return <CheckboxBlock {...commonProps} />;
    
    case 'quote':
      return <QuoteBlock {...commonProps} />;
    
    case 'code':
      return <CodeBlock {...commonProps} />;
    
    case 'divider':
      return <DividerBlock {...commonProps} />;
    
    default:
      return <TextBlock {...commonProps} />;
  }
}