import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tag as TagIcon } from 'lucide-react';

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

function getTagStyle(tag: string): string {
  switch (tag) {
    case '未測量':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case '位置表象':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case '数':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case '図形':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case '言語':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case '推理':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case '記憶':
      return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
    case '論理':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
    case '理科的常識':
      return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
    case '社会的常識':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}