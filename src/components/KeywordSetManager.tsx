'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Hash,
  Layers,
  Loader2,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { KeywordSet } from '@/lib/types';
import { Badge, Field, Select, TextArea, TextInput, Toggle } from './ui';

const LANGUAGES = [
  'English',
  'Arabic',
  'French',
  'Spanish',
  'German',
  'Portuguese',
  'Turkish',
  'Urdu',
  'Hindi',
  'Indonesian',
];

interface Draft {
  id?: string;
  name: string;
  note: string;
  keywordsText: string;
  language: string;
  pinned: boolean;
}

const EMPTY: Draft = {
  name: '',
  note: '',
  keywordsText: '',
  language: 'English',
  pinned: false,
};

export function KeywordSetManager() {
  const [sets, setSets] = useState<KeywordSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.keywordSets
      .list()
      .then((data) => setSets(data.items))
      .catch(() => toast.error('Could not reach the API'))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
  }, []);

  const parseKeywords = (text: string) =>
    text
      .split(/[\n,;]/)
      .map((k) => k.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

  const save = async () => {
    if (!draft) return;

    const keywords = parseKeywords(draft.keywordsText);
    if (draft.name.trim().length < 2) {
      toast.error('Give the set a name');
      return;
    }
    if (!keywords.length) {
      toast.error('Add at least one keyword');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        note: draft.note.trim() || undefined,
        keywords,
        language: draft.language,
        pinned: draft.pinned,
      };

      if (draft.id) {
        await api.keywordSets.update(draft.id, payload);
        toast.success('Set updated');
      } else {
        await api.keywordSets.create(payload);
        toast.success('Set created');
      }

      setDraft(null);
      await load();
    } catch (error) {
      toast.error('Could not save', { description: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (set: KeywordSet) => {
    try {
      await api.keywordSets.update(set.id, { pinned: !set.pinned });
      await load();
    } catch (error) {
      toast.error('Could not update', { description: (error as Error).message });
    }
  };

  const remove = async (set: KeywordSet) => {
    if (!confirm(`Delete the set "${set.name}"?`)) return;
    try {
      await api.keywordSets.remove(set.id);
      toast.success('Set deleted');
      await load();
    } catch (error) {
      toast.error('Delete failed', { description: (error as Error).message });
    }
  };

  const totalKeywords = sets.reduce((sum, s) => sum + s.keywords.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-ink-900">
            <Tags className="h-6 w-6 text-brand-500" />
            Keyword sets
          </h1>
          <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-ink-500">
            Reusable groups of target keywords. Pick a set in the studio and its
            keywords are merged into the article you generate.
          </p>
        </div>

        {!draft ? (
          <button
            onClick={() => setDraft({ ...EMPTY })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/35"
          >
            <Plus className="h-4 w-4" />
            New set
          </button>
        ) : null}
      </header>

      {sets.length ? (
        <p className="mb-4 text-[12.5px] text-ink-400">
          {sets.length} set{sets.length === 1 ? '' : 's'} · {totalKeywords} keywords
        </p>
      ) : null}

      {/* Editor */}
      {draft ? (
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong mb-6 rounded-4xl p-6"
        >
          <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink-900">
            {draft.id ? 'Edit set' : 'New set'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <TextInput
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                dir="auto"
                placeholder="مراتب السرير"
              />
            </Field>

            <Field label="Language">
              <Select
                value={draft.language}
                onChange={(e) => setDraft({ ...draft, language: e.target.value })}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Note" hint="optional">
              <TextInput
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                dir="auto"
                placeholder="When to use this set"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field
              label="Keywords"
              hint={`${parseKeywords(draft.keywordsText).length} · one per line`}
            >
              <TextArea
                rows={6}
                value={draft.keywordsText}
                onChange={(e) => setDraft({ ...draft, keywordsText: e.target.value })}
                dir="auto"
                placeholder={'افضل مراتب\nعروض مراتب السرير\nمراتب السرير\nمراتب سرير'}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Toggle
              checked={draft.pinned}
              onChange={(pinned) => setDraft({ ...draft, pinned })}
              label="Pin this set"
              description="Pinned sets appear first in the studio"
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-glow px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={2.6} />
              )}
              {draft.id ? 'Save changes' : 'Create set'}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-2xl border border-hairline bg-white/70 px-4 py-3 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.section>
      ) : null}

      {/* List */}
      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : !sets.length ? (
        <div className="glass grid place-items-center rounded-3xl py-20 text-center">
          <Layers className="mb-3 h-9 w-9 text-brand-200" />
          <p className="text-[14.5px] font-medium text-ink-800">No keyword sets yet</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-500">
            Group the keywords you target repeatedly so you can apply them in one click.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={set.id}
              className="animate-rise glass group rounded-3xl p-5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink-900">
                    <span dir="auto">{set.name}</span>
                    {set.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-brand-400" /> : null}
                  </h3>
                  {set.note ? (
                    <p dir="auto" className="bidi mt-1 text-[12.5px] text-ink-500">
                      {set.note}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{set.language}</Badge>
                    <Badge>
                      <Hash className="h-2.5 w-2.5" />
                      {set.keywords.length}
                    </Badge>
                    {set.useCount > 0 ? (
                      <Badge tone="neutral">used {set.useCount}×</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => togglePin(set)}
                    title={set.pinned ? 'Unpin' : 'Pin'}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    {set.pinned ? (
                      <PinOff className="h-3.5 w-3.5" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setDraft({
                        id: set.id,
                        name: set.name,
                        note: set.note ?? '',
                        keywordsText: set.keywords.join('\n'),
                        language: set.language,
                        pinned: set.pinned,
                      })
                    }
                    title="Edit"
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(set)}
                    title="Delete"
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-hairline pt-3">
                {set.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    dir="auto"
                    className="rounded-lg bg-brand-50 px-2.5 py-1 text-[12px] text-brand-700 ring-1 ring-brand-100"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
