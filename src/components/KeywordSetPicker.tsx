'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Layers, Loader2, Pin, Plus, Settings2, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { KeywordSet } from '@/lib/types';
import { Field, TextArea, TextInput, Toggle } from './ui';

/**
 * Selecting a set contributes its keywords to the generation. The chips stay
 * visible so it is obvious which terms a set is adding on top of typed ones.
 */
export function KeywordSetPicker({
  selectedIds,
  onChange,
  language,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  language?: string;
}) {
  const [sets, setSets] = useState<KeywordSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [pinned, setPinned] = useState(false);

  const load = () =>
    api.keywordSets
      .list()
      .then((data) => setSets(data.items))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    );

  const save = async () => {
    const keywords = keywordsText
      .split(/[\n,;]/)
      .map((k) => k.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    if (name.trim().length < 2) {
      toast.error('Give the set a name');
      return;
    }
    if (!keywords.length) {
      toast.error('Add at least one keyword');
      return;
    }

    setSaving(true);
    try {
      const created = await api.keywordSets.create({
        name: name.trim(),
        keywords,
        language: language || 'English',
        pinned,
      });
      toast.success(`Saved "${created.name}"`);
      setName('');
      setKeywordsText('');
      setPinned(false);
      setCreating(false);
      await load();
      onChange([...selectedIds, created.id]);
    } catch (error) {
      toast.error('Could not save the set', {
        description: (error as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-hairline bg-white/60 px-3.5 py-3 text-[12.5px] text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading keyword sets…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sets.length ? (
        <div className="flex flex-wrap gap-1.5">
          {sets.map((set) => {
            const active = selectedIds.includes(set.id);
            return (
              <button
                key={set.id}
                type="button"
                onClick={() => toggle(set.id)}
                title={set.keywords.join(' · ')}
                dir="auto"
                className={`group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-[12.5px] transition-all duration-200 ${
                  active
                    ? 'border-brand-400 bg-brand-50 font-medium text-brand-700 ring-2 ring-brand-100'
                    : 'border-hairline bg-white/70 text-ink-600 hover:border-brand-300 hover:bg-white'
                }`}
              >
                {active ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2.8} />
                ) : (
                  <Layers className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                )}
                <span dir="auto" className="whitespace-nowrap">
                  {set.name}
                </span>
                {set.pinned ? (
                  <Pin className="h-3 w-3 shrink-0 text-brand-300" />
                ) : null}
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    active ? 'bg-white/70 text-brand-600' : 'bg-brand-50 text-brand-500'
                  }`}
                >
                  {set.keywords.length}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-[12px] text-ink-400">
          No saved sets yet — create one to reuse keywords across articles.
        </p>
      )}

      {/* Keywords the selected sets contribute */}
      <AnimatePresence initial={false}>
        {selectedIds.length ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 rounded-xl bg-brand-50/60 p-2.5 ring-1 ring-brand-100">
              {sets
                .filter((s) => selectedIds.includes(s.id))
                .flatMap((s) => s.keywords)
                .map((keyword, i) => (
                  <span
                    key={`${keyword}-${i}`}
                    dir="auto"
                    className="rounded-md bg-white px-2 py-0.5 text-[11.5px] text-brand-700 ring-1 ring-brand-100"
                  >
                    {keyword}
                  </span>
                ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Inline creation */}
      <AnimatePresence initial={false}>
        {creating ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-3.5">
              <Field label="Set name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  dir="auto"
                  placeholder="e.g. مراتب السرير"
                />
              </Field>

              <Field label="Keywords" hint="one per line, or comma-separated">
                <TextArea
                  rows={4}
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  dir="auto"
                  placeholder={'افضل مراتب\nعروض مراتب السرير\nمراتب السرير'}
                />
              </Field>

              <Toggle
                checked={pinned}
                onChange={setPinned}
                label="Pin this set"
                description="Pinned sets appear first"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" strokeWidth={2.6} />
                  )}
                  Save set
                </button>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-xl border border-hairline bg-white/70 px-4 py-2.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-3 py-2 text-[12px] font-medium text-brand-600 transition-all hover:border-brand-300 hover:bg-brand-50"
            >
              <Plus className="h-3.5 w-3.5" />
              New set
            </button>

            {selectedIds.length ? (
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] text-ink-400 transition-colors hover:text-ink-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear {selectedIds.length} selected
              </button>
            ) : null}

            <a
              href="/keywords"
              className="ml-auto flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] text-ink-400 transition-colors hover:text-brand-600"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Manage
            </a>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
