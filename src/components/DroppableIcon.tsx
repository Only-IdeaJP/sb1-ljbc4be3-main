import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Check, Image as ImageIcon, Tag as TagIcon } from "lucide-react";
import { getTagStyle } from "../../constant/Constant";

interface DroppableIconProps {
  id: string;
  tags: string[];
  pageNumber: number;
  preview: string | null;
  onClick: () => void;
}

export const DroppableIcon: React.FC<DroppableIconProps> = ({
  id,
  tags,
  pageNumber,
  preview,
  onClick,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `icon-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* メインのプレビュー */}
      <div
        className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
          isOver
            ? "border-indigo-500 ring-4 ring-indigo-200"
            : tags.length > 0
            ? "border-green-500"
            : "border-transparent"
        } transition-all duration-200 relative hover:border-indigo-300`}
      >
        {preview ? (
          <img
            src={preview}
            alt={`ページ ${pageNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* ページ番号 */}
        <div className="absolute top-1 right-1 bg-gray-900/75 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {pageNumber}
        </div>

        {/* タグ追加時のアニメーション */}
        {isOver && (
          <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
            <TagIcon className="w-8 h-8 text-indigo-500 animate-bounce" />
          </div>
        )}

        {/* タグ設定済みマーク */}
        {tags.length > 0 && (
          <div className="absolute bottom-1 left-1 bg-green-500 text-white rounded-full p-1">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* タグカウンター */}
      {tags.length > 0 && (
        <div className="absolute -bottom-2 -right-2 flex items-center space-x-1 bg-white rounded-full shadow-lg px-2 py-1 border border-gray-100">
          <TagIcon className="w-3 h-3 text-indigo-500" />
          <span className="text-xs font-medium text-gray-700">
            {tags.length}
          </span>
        </div>
      )}

      {/* タグリストのポップオーバー */}
      <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 w-48 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
        <div className="flex flex-wrap gap-1">
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTagStyle(
                  tag
                )} animate-fadeIn`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))
          ) : (
            <div className="text-xs text-gray-500 text-center py-1">
              タグがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
