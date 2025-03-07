// applyAllTags 関数を以下のように修正
const applyAllTags = () => {
  if (!confirm('全てのタグを付与しますか？この操作は元に戻せません。')) {
    return;
  }

  // バッチ処理で更新して、パフォーマンスを改善
  const batchSize = 10;
  const selectedKeys = Array.from(selectedFiles);
  
  setFiles(prev => {
    const newFiles = [...prev];
    
    for (let i = 0; i < selectedKeys.length; i += batchSize) {
      const batch = selectedKeys.slice(i, i + batchSize);
      
      batch.forEach(key => {
        const [fileId, pageId] = key.split('-');
        const fileIndex = newFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return;
        
        const pageIndex = newFiles[fileIndex].pages.findIndex(p => p.id === pageId);
        if (pageIndex === -1) return;
        
        // 既存のタグを保持しつつ、新しいタグを追加
        const existingTags = new Set(newFiles[fileIndex].pages[pageIndex].tags);
        DEFAULT_TAGS.forEach(tag => existingTags.add(tag));
        newFiles[fileIndex].pages[pageIndex].tags = Array.from(existingTags);
      });
    }
    
    return newFiles;
  });

  // 操作完了後にメッセージを表示
  setMessage({
    type: 'success',
    text: '選択したページに全てのタグを付与しました'
  });
};

export default applyAllTags