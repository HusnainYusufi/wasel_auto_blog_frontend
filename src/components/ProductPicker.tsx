'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Package } from 'lucide-react';
import { api } from '@/lib/api';
import type { KnowledgeSource } from '@/lib/types';

/**
 * Product pages to link from the article body, drawn from crawled knowledge
 * sources. Anything already crawled is selectable, so no separate catalogue.
 */
export function ProductPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.knowledge
      .list()
      .then((d) => setSources(d.items.filter((s) => s.status === 'ready')))
      .catch(() => setSources([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    );

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-hairline bg-white/60 px-3.5 py-3 text-[12.5px] text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading pages…
      </div>
    );
  }

  if (!sources.length) {
    return (
      <p className="rounded-xl border border-dashed border-hairline px-3.5 py-3 text-[12px] text-ink-400">
        Crawl a product page on the Knowledge tab first, then select it here.
      </p>
    );
  }

  return (
    <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-hairline bg-white/60 p-2">
      {sources.map((s) => {
        const active = selectedIds.includes(s.id);
        // Storefront titles carry a "| brand" tail that adds nothing here.
        const name = (s.title ?? s.url).split('|')[0].trim();
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            title={s.url}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[12px] transition-all ${
              active
                ? 'border-brand-400 bg-brand-50 font-medium text-brand-700'
                : 'border-hairline bg-white text-ink-600 hover:border-brand-300'
            }`}
          >
            {active ? (
              <Check className="h-3 w-3 shrink-0 text-brand-500" strokeWidth={2.8} />
            ) : (
              <Package className="h-3 w-3 shrink-0 text-ink-400" />
            )}
            <span dir="auto">{name.slice(0, 40)}</span>
          </button>
        );
      })}
    </div>
  );
}
