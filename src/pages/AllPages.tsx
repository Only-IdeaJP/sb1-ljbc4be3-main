// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import { supabase } from '../lib/supabase';
// import { Tag as TagIcon, Trash2, AlertCircle } from 'lucide-react';

// interface Paper {
//   id: string;
//   file_path: string;
//   tags: string[];
//   is_correct: boolean;
//   last_practiced: string | null;
//   next_practice_date: string | null;
// }

// const DEFAULT_TAGS = [
//   '未測量', '位置表象', '数', '図形', '言語',
//   '推理', '記憶', '論理', '理科的常識', '社会的常識'
// ];

// const getDifficultyLabel = (paper: Paper): { label: string; color: string } => {
//   if (!paper.last_practiced) {
//     return { label: '未', color: 'bg-gray-100 text-gray-800' };
//   }

//   if (paper.is_correct) {
//     return { label: '', color: '' }; // 正解の場合は何も表示しない
//   }

//   const daysSinceLastPractice = Math.floor(
//     (new Date().getTime() - new Date(paper.last_practiced).getTime()) / (1000 * 60 * 60 * 24)
//   );

//   if (daysSinceLastPractice < 3) {
//     return { label: '難★', color: 'bg-yellow-100 text-yellow-800' };
//   } else if (daysSinceLastPractice < 7) {
//     return { label: '難★★', color: 'bg-orange-100 text-orange-800' };
//   } else if (daysSinceLastPractice < 30) {
//     return { label: '難★★★', color: 'bg-red-100 text-red-800' };
//   } else {
//     return { label: '難★★★★', color: 'bg-purple-100 text-purple-800' };
//   }
// };

// export const AllPages: React.FC = () => {
//   const { user } = useAuth();
//   const [papers, setPapers] = useState<Paper[]>([]);
//   const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
//   const [activeTag, setActiveTag] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   useEffect(() => {
//     const fetchPapers = async () => {
//       if (!user) return;
//       setLoading(true);
//       try {
//         const { data, error } = await supabase
//           .from('papers')
//           .select('*')
//           .eq('user_id', user.id)
//           .order('created_at', { ascending: false });

//         if (error) throw error;
//         setPapers(data || []);
//       } catch (err: any) {
//         setMessage({ type: 'error', text: err.message });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPapers();
//   }, [user]);

//   const handleDelete = async () => {
//     if (selectedPapers.size === 0) return;

//     if (!confirm('選択した問題を削除してもよろしいですか？')) return;

//     setLoading(true);
//     try {
//       const { error } = await supabase
//         .from('papers')
//         .delete()
//         .in('id', Array.from(selectedPapers));

//       if (error) throw error;

//       setPapers(prev => prev.filter(p => !selectedPapers.has(p.id)));
//       setSelectedPapers(new Set());
//       setMessage({ type: 'success', text: '選択した問題を削除しました' });
//     } catch (err: any) {
//       setMessage({ type: 'error', text: err.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredPapers = activeTag
//     ? papers.filter(paper => paper.tags.includes(activeTag))
//     : papers;

//   const getTagStyle = (tag: string): string => {
//     switch (tag) {
//       case '未測量':
//         return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
//       case '位置表象':
//         return 'bg-red-100 text-red-800 hover:bg-red-200';
//       case '数':
//         return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
//       case '図形':
//         return 'bg-green-100 text-green-800 hover:bg-green-200';
//       case '言語':
//         return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
//       case '推理':
//         return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
//       case '記憶':
//         return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
//       case '論理':
//         return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
//       case '理科的常識':
//         return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
//       case '社会的常識':
//         return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
//       default:
//         return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-900 mb-4">全ページ管理</h1>
//         <p className="text-gray-600">
//           タグをクリックして問題を絞り込むことができます。チェックボックスで選択した問題を一括削除できます。
//         </p>
//       </div>

//       {message && (
//         <div className={`p-4 rounded-md mb-6 ${
//           message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
//         }`}>
//           <div className="flex items-center">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             {message.text}
//           </div>
//         </div>
//       )}

//       {/* タグフィルター */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//         <div className="flex flex-wrap gap-2">
//           {DEFAULT_TAGS.map(tag => (
//             <button
//               key={tag}
//               onClick={() => setActiveTag(activeTag === tag ? null : tag)}
//               className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
//                 activeTag === tag ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
//               } ${getTagStyle(tag)}`}
//             >
//               <TagIcon className="w-4 h-4 mr-1.5" />
//               {tag}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* 削除ボタン */}
//       {selectedPapers.size > 0 && (
//         <div className="mb-6">
//           <button
//             onClick={handleDelete}
//             className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//           >
//             <Trash2 className="h-4 w-4 mr-2" />
//             選択した問題を削除 ({selectedPapers.size}件)
//           </button>
//         </div>
//       )}

//       {/* 問題一覧 */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {loading ? (
//           <div className="col-span-full text-center py-12 text-gray-500">
//             読み込み中...
//           </div>
//         ) : filteredPapers.length === 0 ? (
//           <div className="col-span-full text-center py-12 text-gray-500">
//             問題が見つかりませんでした
//           </div>
//         ) : (
//           filteredPapers.map((paper) => {
//             const difficulty = getDifficultyLabel(paper);
//             return (
//               <div key={paper.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
//                 <div className="p-2">
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={selectedPapers.has(paper.id)}
//                         onChange={(e) => {
//                           const newSelected = new Set(selectedPapers);
//                           if (e.target.checked) {
//                             newSelected.add(paper.id);
//                           } else {
//                             newSelected.delete(paper.id);
//                           }
//                           setSelectedPapers(newSelected);
//                         }}
//                         className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
//                       />
//                     </div>
//                     {difficulty.label && (
//                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}>
//                         {difficulty.label}
//                       </span>
//                     )}
//                   </div>

//                   <div className="relative">
//                     <img
//                       src={paper.file_path}
//                       alt="問題"
//                       className="w-full h-auto rounded"
//                     />
//                   </div>

//                   <div className="mt-2 flex flex-wrap gap-1">
//                     {paper.tags.map(tag => (
//                       <span
//                         key={tag}
//                         className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getTagStyle(tag)}`}
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Tag as TagIcon, Trash2, AlertCircle } from "lucide-react";
import { DEFAULT_TAGS, TAG_STYLES } from "../../constant/Constant";

interface Paper {
  id: string;
  file_path: string;
  tags: string[];
  is_correct: boolean;
  last_practiced: string | null;
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

export const AllPages: React.FC = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [user]);

  const handleDelete = async () => {
    if (
      selectedPapers.length === 0 ||
      !confirm("選択した問題を削除してもよろしいですか？")
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
      setMessage({ type: "success", text: "選択した問題を削除しました" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = useMemo(
    () =>
      activeTag ? papers.filter((p) => p.tags.includes(activeTag)) : papers,
    [papers, activeTag]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">全ページ管理</h1>
      <p className="text-gray-600">
        タグをクリックして問題を絞り込むことができます。
      </p>

      {message && <MessageBox type={message.type} text={message.text} />}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap gap-2">
        {DEFAULT_TAGS.map((tag) => (
          <TagButton
            key={tag}
            tag={tag}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />
        ))}
      </div>

      {selectedPapers.length > 0 && (
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 mb-6"
        >
          <Trash2 className="h-4 w-4 mr-2" /> 選択した問題を削除 (
          {selectedPapers.length}件)
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-12 text-gray-500">
            読み込み中...
          </p>
        ) : filteredPapers.length === 0 ? (
          <p className="col-span-full text-center py-12 text-gray-500">
            問題が見つかりませんでした
          </p>
        ) : (
          filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              selectedPapers={selectedPapers}
              setSelectedPapers={setSelectedPapers}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TagButton: React.FC<{
  tag: string;
  activeTag: string | null;
  setActiveTag: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ tag, activeTag, setActiveTag }) => (
  <button
    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      TAG_STYLES[tag]
    } ${activeTag === tag ? "ring-2 ring-indigo-500" : ""}`}
  >
    <TagIcon className="w-4 h-4 mr-1.5" /> {tag}
  </button>
);

const PaperCard: React.FC<{
  paper: Paper;
  selectedPapers: string[];
  setSelectedPapers: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ paper, selectedPapers, setSelectedPapers }) => {
  const difficulty = getDifficultyLabel(paper);
  return (
    <div className="bg-white rounded-lg shadow-sm p-2">
      <input
        type="checkbox"
        checked={selectedPapers.includes(paper.id)}
        onChange={() =>
          setSelectedPapers((prev) =>
            prev.includes(paper.id)
              ? prev.filter((id) => id !== paper.id)
              : [...prev, paper.id]
          )
        }
      />
      {difficulty.label && (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.color}`}
        >
          {difficulty.label}
        </span>
      )}
      <img src={paper.file_path} alt="問題" className="w-full rounded" />
    </div>
  );
};

const MessageBox: React.FC<{ type: "success" | "error"; text: string }> = ({
  type,
  text,
}) => (
  <div
    className={`p-4 rounded-md mb-6 ${
      type === "success"
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-700"
    }`}
  >
    <AlertCircle className="h-5 w-5 mr-2" /> {text}
  </div>
);
