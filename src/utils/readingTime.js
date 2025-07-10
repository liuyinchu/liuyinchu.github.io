/**
 * 计算文本的预计阅读时间
 * @param {string} text - 要计算的文本内容
 * @param {number} wordsPerMinute - 每分钟阅读的字数，中文通常在 200-300 之间
 * @returns {string} - 格式化的阅读时间字符串, e.g., "5 min read"
 */
export function calculateReadingTime(text, wordsPerMinute = 250) {
  // 移除 Markdown 格式和代码块，更准确地统计字数
  const cleanedText = text
    .replace(/#+\s/g, '') // 移除标题标记
    .replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g, '') // 移除 LaTeX 公式
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/`[^`]+`/g, '') // 移除行内代码
    .replace(/[*\-_>#\[\]()]/g, ''); // 移除其他 Markdown 符号

  const wordCount = cleanedText.length;
  if (wordCount === 0) return '1 min read'; // 至少1分钟
  
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}