'use client';

import { useState, type KeyboardEvent } from 'react';
import { X, Hash } from 'lucide-react';

export function KeywordInput({
  keywords,
  onChange,
  max = 15,
}: {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  max?: number;
}) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const additions = raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (!additions.length) return;

    const next = [...keywords];
    for (const keyword of additions) {
      if (next.length >= max) break;
      if (!next.some((k) => k.toLowerCase() === keyword.toLowerCase())) next.push(keyword);
    }
    onChange(next);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(draft);
    } else if (event.key === 'Backspace' && !draft && keywords.length) {
      onChange(keywords.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-xl border border-hairline bg-white/80 px-2.5 py-2 transition-all duration-200 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100">
      {keywords.map((keyword) => (
        <span
          key={keyword}
          className="animate-rise inline-flex items-center gap-1 rounded-lg bg-brand-50 py-1 pl-2 pr-1 text-[12px] font-medium text-brand-700 ring-1 ring-brand-100"
        >
          <Hash className="h-3 w-3 text-brand-400" strokeWidth={2.4} />
          {keyword}
          <button
            type="button"
            onClick={() => onChange(keywords.filter((k) => k !== keyword))}
            className="rounded-md p-0.5 text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700"
            aria-label={`Remove ${keyword}`}
          >
            <X className="h-3 w-3" strokeWidth={2.6} />
          </button>
        </span>
      ))}

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        disabled={keywords.length >= max}
        placeholder={keywords.length ? 'Add another…' : 'seo keyword, long tail phrase…'}
        className="min-w-[9rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-ink-800 outline-none placeholder:text-ink-400 disabled:cursor-not-allowed"
      />
    </div>
  );
}
