/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { DEFAULT_TAGS } from "../../constant/Constant";

const UploadPapers: React.FC = () => {
  // State to manage the selected files (this is just an example setup)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set()); // Selected file keys
  const [files, setFiles] = useState<any[]>([]); // Files array containing uploaded files
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // Handle file upload (just simulating file upload in this example)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;

    if (uploadedFiles) {
      const newFiles = Array.from(uploadedFiles).map((file, index) => ({
        id: `file-${index}`,
        name: file.name,
        pages: [
          {
            id: `file-${index}-page-1`,
            tags: [], // Initial tags for the page
            content: file, // The actual file content (in a real app, you'd store it or process it)
          },
        ],
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setMessage({
        type: "success",
        text: "ファイルが正常にアップロードされました。",
      });
    }
  };

  // Apply all tags to the selected pages
  const applyAllTags = () => {
    if (!confirm("全てのタグを付与しますか？この操作は元に戻せません。")) {
      return;
    }

    // Batch processing for performance
    const batchSize = 10;
    const selectedKeys = Array.from(selectedFiles); // Get selected keys from the Set

    setFiles((prev) => {
      const newFiles = [...prev];

      // Loop through selectedKeys in batches
      for (let i = 0; i < selectedKeys.length; i += batchSize) {
        const batch = selectedKeys.slice(i, i + batchSize);

        batch.forEach((key) => {
          const [fileId, pageId] = key.split("-");
          const file = newFiles.find((f) => f.id === fileId);
          const page = file?.pages.find((p: { id: string }) => p.id === pageId);

          if (!file || !page) return;

          // Add the default tags while avoiding duplicates using a Set
          page.tags = Array.from(new Set([...page.tags, ...DEFAULT_TAGS]));
        });
      }

      return newFiles;
    });

    // After operation, display success message
    setMessage({
      type: "success",
      text: "選択したページに全てのタグを付与しました。",
    });
  };

  // Handle selecting files/pages
  const handleFileSelection = (fileId: string, pageId: string) => {
    setSelectedFiles((prev) => {
      const newSelectedFiles = new Set(prev);
      const key = `${fileId}-${pageId}`;
      if (newSelectedFiles.has(key)) {
        newSelectedFiles.delete(key); // Deselect if already selected
      } else {
        newSelectedFiles.add(key); // Select if not selected
      }
      return newSelectedFiles;
    });
  };

  return (
    <div>
      {/* File upload */}
      <input type="file" multiple onChange={handleFileUpload} />
      <div>
        {/* Display uploaded files */}
        <h3>アップロードされたファイル</h3>
        {files.length === 0 ? (
          <p>ファイルがありません</p>
        ) : (
          <div>
            {files.map((file) => (
              <div key={file.id}>
                <h4>{file.name}</h4>
                {/* Display pages for each file */}
                {file.pages.map((page: any) => (
                  <div key={page.id}>
                    <input
                      type="checkbox"
                      onChange={() => handleFileSelection(file.id, page.id)}
                      checked={selectedFiles.has(`${file.id}-${page.id}`)}
                    />
                    <span>ページ {page.id}</span>
                    <div>タグ: {page.tags.join(", ")}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply all tags */}
      <button onClick={applyAllTags}>全てのタグを付与</button>

      {/* Message area to display success or error messages */}
      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default UploadPapers;
