// src/pages/AllPages.tsx
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  Grid, List,
  RotateCcw,
  Search, SlidersHorizontal,
  Tag as TagIcon, Trash2
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_TAGS, TAG_COLORS } from "../constant/Constant";

import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface Paper {
  id: string;
  file_path: string;
  tags: string[];
  is_correct: boolean;
  last_practiced: string | null;
  created_at: string;
}

const getDifficultyLabel = (paper: Paper) => {
  if (!paper.last_practiced)
    return { label: "未", color: "bg-gray-100 text-gray-800" };
  if (paper.is_correct) return { label: "", color: "" };

  const days = Math.floor(
    (Date.now() - new Date(paper.last_practiced).getTime()) / 86400000
  );
  if (days < 3) return { label: "難★", color: "bg-yellow-100 text-yellow-800" };
  if (days < 7)
    return { label: "難★★", color: "bg-orange-100 text-orange-800" };
  if (days < 30) return { label: "難★★★", color: "bg-red-100 text-red-800" };
  return { label: "難★★★★", color: "bg-purple-100 text-purple-800" };
};

/**
 * 全ページ管理コンポーネント
 * アップロードした全ての問題を管理する
 */
/**
 * PaperCardコンポーネント
 * グリッドビューで表示する問題カード
 */
const PaperCard: React.FC<{
  paper: Paper;
  isSelected: boolean;
  toggleSelect: () => void;
}> = ({ paper, isSelected, toggleSelect }) => {
  const difficulty = getDifficultyLabel(paper);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm overflow-hidden border transition-all ${isSelected ? 'border-indigo-500 shadow-md scale-[1.02]' : 'border-transparent hover:border-gray-300'
      }`}>
      {/* 選択チェックボックス */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={toggleSelect}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
      </div>

      {/* 難易度ラベル */}
      {difficulty.label && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>
      )}

      {/* 画像 */}
      <div className="aspect-square w-full overflow-hidden bg-gray-200">
        <img
          src={paper.file_path}
          alt="問題"
          className="w-full h-full object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* タグ表示 */}
      <div className="p-3">
        <div className="flex flex-wrap gap-1 mt-1">
          {paper.tags.map(tag => {
            // 修正: タグスタイルをTAG_COLORS定数から直接取得
            const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
            const { bg, text } = tagStyle;
            return (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            );
          })}
          {paper.tags.length === 0 && (
            <span className="text-xs text-gray-400">タグなし</span>
          )}
        </div>

        {/* 日付表示 */}
        <div className="text-xs text-gray-500 mt-2">
          {new Date(paper.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export const AllPages: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "tags" | "difficulty">("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 問題の取得
  useEffect(() => {
    const fetchPapers = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("papers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPapers(data || []);
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [user]);

  // 選択したすべての問題を削除
  const handleDelete = async () => {
    if (
      selectedPapers.length === 0 ||
      !confirm(`選択した${selectedPapers.length}問を削除してもよろしいですか？この操作は元に戻せません。`)
    )
      return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("papers")
        .delete()
        .in("id", selectedPapers);
      if (error) throw error;

      setPapers((prev) => prev.filter((p) => !selectedPapers.includes(p.id)));
      setSelectedPapers([]);
      setMessage({ type: "success", text: `選択した${selectedPapers.length}問を削除しました` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // タグの一括適用
  const applyTagToSelected = (tag: string) => {
    if (selectedPapers.length === 0) return;
    if (!confirm(`選択した${selectedPapers.length}問に「${tag}」タグを適用しますか？`)) return;

    setLoading(true);
    const updates = papers
      .filter(paper => selectedPapers.includes(paper.id))
      .map(paper => ({
        id: paper.id,
        tags: paper.tags.includes(tag) ? paper.tags : [...paper.tags, tag]
      }));

    const updatePapers = async () => {
      try {
        const { error } = await supabase
          .from("papers")
          .upsert(updates);

        if (error) throw error;

        // 成功したら、ローカルのデータも更新
        setPapers(prev => prev.map(paper => {
          const update = updates.find(u => u.id === paper.id);
          if (update) {
            return { ...paper, tags: update.tags };
          }
          return paper;
        }));

        setMessage({
          type: "success",
          text: `選択した${selectedPapers.length}問に「${tag}」タグを適用しました`
        });
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };

    updatePapers();
  };

  // タグの切り替え
  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedPapers.length === filteredPapers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(filteredPapers.map(p => p.id));
    }
  };

  // フィルタリングされた問題
  const filteredPapers = useMemo(() => {
    let result = [...papers];

    // タグによるフィルタリング
    if (activeTags.length > 0) {
      result = result.filter(paper =>
        activeTags.every(tag => paper.tags.includes(tag))
      );
    }

    // 検索語によるフィルタリング
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(paper =>
        paper.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // ソート
    if (sortBy === "date") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "tags") {
      result.sort((a, b) => a.tags.length - b.tags.length);
    } else if (sortBy === "difficulty") {
      result.sort((a, b) => {
        const diffA = getDifficultyLabel(a).label;
        const diffB = getDifficultyLabel(b).label;
        return (diffB || "").length - (diffA || "").length;
      });
    }

    return result;
  }, [papers, activeTags, searchTerm, sortBy]);

  // タグのカウント集計
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    papers.forEach(paper => {
      paper.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [papers]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">全ページ管理</h1>
      <p className="text-gray-600 mb-6">
        アップロードした問題を管理・編集します。タグをクリックして問題を絞り込むことができます。
      </p>

      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* 検索とフィルターエリア */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* 検索ボックス */}
          <div className="flex-1 min-w-[200px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タグで検索..."
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 表示切替ボタン */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 ${viewMode === "grid" ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-600"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 ${viewMode === "list" ? "bg-indigo-100 text-indigo-700" : "bg-white text-gray-600"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* ソート切替 */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-1 px-3 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>並び替え</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border">
                <button
                  onClick={() => { setSortBy("date"); setIsFilterOpen(false); }}
                  className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "date" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  日付順
                </button>
                <button
                  onClick={() => { setSortBy("tags"); setIsFilterOpen(false); }}
                  className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "tags" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <TagIcon className="h-4 w-4 inline mr-2" />
                  タグ数順
                </button>
                <button
                  onClick={() => { setSortBy("difficulty"); setIsFilterOpen(false); }}
                  className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "difficulty" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  難易度順
                </button>
              </div>
            )}
          </div>

          {/* フィルターボタン - カウンターを右側に配置 */}
          <button
            className={`px-3 py-2 border rounded-md flex items-center ${activeTags.length > 0 ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-white text-gray-600"}`}
            onClick={() => setActiveTags([])}
            disabled={activeTags.length === 0}
          >
            <Filter className="h-5 w-5" />
            {activeTags.length > 0 && (
              <span className="ml-1 inline-block bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                {activeTags.length}
              </span>
            )}
          </button>
        </div>

        {/* タグフィルター */}
        <div className="flex flex-wrap gap-2">
          {DEFAULT_TAGS.map((tag) => {
            const isActive = activeTags.includes(tag);
            // 修正: タグスタイルをTAG_COLORS定数から直接取得
            const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
            const { bg, text, hoverBg, border } = tagStyle;
            const count = tagCounts[tag] || 0;

            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isActive
                  ? `${bg} ${text} border-2 ${border} shadow-sm`
                  : `bg-white ${text} border ${border} ${hoverBg}`
                  } transition-all`}
              >
                <TagIcon className="w-4 h-4 mr-1.5" />
                {tag}
                <span className="ml-1.5 text-xs bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択時のアクションバー */}
      {selectedPapers.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 shadow-sm animate-fadeIn">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <span className="font-medium text-indigo-700">
                {selectedPapers.length}問を選択中
              </span>
            </div>

            {/* タグ一括適用ドロップダウン - z-indexを高く設定 */}
            <div className="relative group">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center">
                <TagIcon className="w-4 h-4 mr-2" />
                タグ適用
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* タグ適用ドロップダウンメニュー - z-indexを高く設定 */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border hidden group-hover:block">
                {DEFAULT_TAGS.map((tag) => {
                  // 修正: タグスタイルをTAG_COLORS定数から直接取得
                  const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
                  const { bg, text } = tagStyle;
                  return (
                    <button
                      key={tag}
                      onClick={() => applyTagToSelected(tag)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded ${bg} ${text} text-xs`}>
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 全選択/解除ボタン */}
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {selectedPapers.length === filteredPapers.length ? (
                <span className="inline-flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  選択解除
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  全て選択
                </span>
              )}
            </button>

            {/* 削除ボタン */}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除 ({selectedPapers.length})
            </button>
          </div>
        </div>
      )}

      {/* ページ一覧 - グリッドまたはリスト表示 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="ml-3 text-gray-500">読み込み中...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TagIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">問題が見つかりませんでした</h3>
          <p className="text-gray-500 mb-6">
            {activeTags.length > 0
              ? 'フィルターを解除するか、別のタグで試してください。'
              : '問題をアップロードしてタグ付けを行いましょう。'}
          </p>
          <button
            onClick={() => setActiveTags([])}
            className={`px-4 py-2 ${activeTags.length > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              } rounded-md`}
            disabled={activeTags.length === 0}
          >
            フィルターを解除
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isSelected={selectedPapers.includes(paper.id)}
              toggleSelect={() => {
                setSelectedPapers(prev =>
                  prev.includes(paper.id)
                    ? prev.filter(id => id !== paper.id)
                    : [...prev, paper.id]
                );
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={filteredPapers.length > 0 && selectedPapers.length === filteredPapers.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  問題
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タグ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アップロード日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPapers.map((paper) => (
                <tr
                  key={paper.id}
                  className={`${selectedPapers.includes(paper.id) ? 'bg-indigo-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPapers.includes(paper.id)}
                      onChange={() => {
                        setSelectedPapers(prev =>
                          prev.includes(paper.id)
                            ? prev.filter(id => id !== paper.id)
                            : [...prev, paper.id]
                        );
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-md object-cover" src={paper.file_path} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          問題 #{paper.id.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {paper.tags.map(tag => {
                        // 修正: タグスタイルをgetTagStyle関数を使用して取得
                        const tagStyle = TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.default;
                        const { bg, text } = tagStyle;
                        return (
                          <span
                            key={tag}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const difficulty = getDifficultyLabel(paper);
                      return difficulty.label ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          完了
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(paper.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};