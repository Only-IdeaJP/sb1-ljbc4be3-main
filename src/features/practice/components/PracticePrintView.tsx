
// features/practice/components/PracticePrintView.tsx

interface PracticePrintViewProps {
    papers: Paper[];
}

/**
 * 印刷用ビューコンポーネント
 */
export const PracticePrintView: React.FC<PracticePrintViewProps> = ({ papers }) => {
    return (
        <div className="hidden print:block print-content">
            {papers.map((paper, index) => (
                <div key={paper.id} className="print-paper">
                    <div className="mb-4">
                        <div className="text-xl font-bold">問題 {index + 1}</div>
                        <div className="text-sm text-gray-600 mt-1">
                            {paper.tags.join(" / ")}
                        </div>
                    </div>
                    <img
                        src={paper.file_path}
                        alt={`問題 ${index + 1}`}
                        className="w-full h-auto max-h-[80vh]"
                        style={{ pageBreakInside: "avoid" }}
                    />
                </div>
            ))}
        </div>
    );
};
