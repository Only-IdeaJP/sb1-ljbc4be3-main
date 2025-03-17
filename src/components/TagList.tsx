import React from "react";
import { DraggableTag } from "./DraggableTag";

interface TagListProps {
  tags: string[];
}

export const TagList: React.FC<TagListProps> = ({ tags }) => {
  if (!tags.length) return null; // Prevent rendering an empty container

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm">
      {tags.map((tag) => (
        <DraggableTag key={tag} id={tag} tag={tag} />
      ))}
    </div>
  );
};
