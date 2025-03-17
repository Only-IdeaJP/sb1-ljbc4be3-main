import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tag as TagIcon } from 'lucide-react';
import { getTagStyle } from '../../constant/Constant';

interface DraggableTagProps {
  id: string;
  tag: string;
}

export const DraggableTag: React.FC<DraggableTagProps> = ({ id, tag }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tag-${id}`,
    data: { tag }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
        isDragging ? 'opacity-50' : ''
      } cursor-move transition-all transform hover:scale-105 ${getTagStyle(tag)}`}
    >
      <TagIcon className="w-3.5 h-3.5 mr-1.5" />
      {tag}
    </div>
  );
};
