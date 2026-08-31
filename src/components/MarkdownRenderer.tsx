import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse simple legal markdown elements cleanly
  const lines = content.split('\n');

  return (
    <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold text-amber-600 dark:text-amber-400 border-b border-amber-500/20 pb-1 mt-4 mb-2">
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-md font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">
              {trimmed.replace('#### ', '')}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = trimmed.substring(2);
          return (
            <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-300 pl-1">
              <span dangerouslySetInnerHTML={{ __html: formatInline(listText) }} />
            </li>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const itemText = trimmed.replace(/^\d+\.\s/, '');
          return (
            <div key={idx} className="flex gap-2 ml-2 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-amber-600 dark:text-amber-400 shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
            </div>
          );
        }

        if (trimmed.startsWith('>')) {
          return (
            <blockquote key={idx} className="border-l-4 border-amber-500/60 pl-4 py-1 my-2 bg-amber-500/10 dark:bg-amber-500/5 rounded-r text-amber-900 dark:text-amber-200/90 italic text-sm">
              <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace('>', '').trim()) }} />
            </blockquote>
          );
        }

        if (trimmed.length === 0) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="text-slate-800 dark:text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      })}
    </div>
  );
};

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-700 dark:text-amber-300">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600 dark:text-slate-400">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
}
