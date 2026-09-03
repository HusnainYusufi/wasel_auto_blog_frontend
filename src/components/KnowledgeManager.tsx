'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrainCircuit,
  Check,
  ExternalLink,
  Globe,
  Lightbulb,
  Link2,
  Loader2,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { KnowledgeList, KnowledgeProfile } from '@/lib/types';
import { Badge, Field, TextArea, Toggle } from './ui';

export function KnowledgeManager() {
  const router = useRouter();

  const [list, setList] = useState<KnowledgeList | null>(null);
  const [profile, setProfile] = useState<KnowledgeProfile | null>(null);
  const [urls, setUrls] = useState('');
  const [discoverLinks, setDiscoverLinks] = useState(true);
  const [maxPages, setMaxPages] = useState(8);
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [sources, prof] = await Promise.all([
        api.knowledge.list(),
        api.knowledge.profile(),
      ]);
      setList(sources);
      setProfile(prof);
      return sources;
    } catch {
      toast.error('Could not reach the API');
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll only while pages are still being crawled.
  useEffect(() => {
    if (!list?.pending) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;

    pollRef.current = setInterval(() => void refresh(), 2500);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [list?.pending, refresh]);

  const addUrls = async () => {
    const parsed = urls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (!parsed.length) {
      toast.error('Paste at least one URL');
      return;
    }

    setAdding(true);
    try {
      const res = await api.knowledge.add({ urls: parsed, discoverLinks, maxPages });
      toast.success(
        res.created > 0
          ? `Crawling ${res.created} page${res.created > 1 ? 's' : ''}…`
          : 'Those URLs are already in the knowledge base',
      );
      setUrls('');
      await refresh();
    } catch (error) {
      toast.error('Could not add sources', { description: (error as Error).message });
    } finally {
      setAdding(false);
    }
  };

  const rebuild = async () => {
    setAnalyzing(true);
    try {
      const prof = await api.knowledge.rebuildProfile();
      setProfile(prof);
      toast.success('Knowledge profile rebuilt');
    } catch (error) {
      toast.error('Analysis failed', { description: (error as Error).message });
    } finally {
      setAnalyzing(false);
    }
  };

  const removeSource = async (id: string) => {
    try {
      await api.knowledge.remove(id);
      await refresh();
    } catch (error) {
      toast.error('Delete failed', { description: (error as Error).message });
    }
  };

  const recrawl = async (id: string) => {
    try {
      await api.knowledge.recrawl(id);
      await refresh();
      toast.success('Re-crawled');
    } catch (error) {
      toast.error('Re-crawl failed', { description: (error as Error).message });
    }
  };

  const writeTopic = (title: string, keywords: string[]) => {
    const params = new URLSearchParams({ topic: title, keywords: keywords.join(',') });
    router.push(`/?${params.toString()}`);
  };

  const ready = list?.ready ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-12">
      <header className="mb-7">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-ink-900">
          <BrainCircuit className="h-6 w-6 text-brand-500" />
          Knowledge base
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-500">
          Point it at blogs you have already published. It reads them, learns your niche
          and house style, tells you what is missing — and every new article is written to
          match, without repeating ground you have covered.
        </p>
      </header>

      {/* Add sources */}
      <section className="glass-strong rounded-4xl p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-glow shadow-lg shadow-brand-500/25">
            <Globe className="h-4.5 w-4.5 text-white" strokeWidth={2.1} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
              Add source URLs
            </h2>
            <p className="text-[12.5px] text-ink-500">
              One per line — a blog index, or individual posts.
            </p>
          </div>
        </div>

        <Field label="URLs" hint="up to 25">
          <TextArea
            rows={3}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={'https://yoursite.com/blog\nhttps://yoursite.com/blog/a-previous-post'}
            className="font-mono text-[12.5px]"
          />
        </Field>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={discoverLinks}
            onChange={setDiscoverLinks}
            label="Follow links from these pages"
            description="Treat each URL as an index and pull in its posts"
          />
          <div className="rounded-xl border border-hairline bg-white/70 px-3.5 py-2.5">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-ink-800">Max pages</span>
              <span className="text-[12px] tabular-nums text-brand-600">{maxPages}</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              disabled={!discoverLinks}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-500 disabled:opacity-40"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addUrls}
          disabled={adding}
          className="group relative mt-5 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-glow px-6 py-3.5 text-[14.5px] font-semibold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-[0.99] disabled:opacity-70"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Adding…
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" strokeWidth={2.2} /> Crawl these pages
            </>
          )}
        </button>
      </section>

      {/* Profile */}
      {ready > 0 ? (
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink-900">
              <Target className="h-4.5 w-4.5 text-brand-500" />
              Niche profile
              {profile?.stale && profile?.exists ? (
                <Badge tone="neutral">out of date</Badge>
              ) : null}
            </h2>
            <button
              onClick={rebuild}
              disabled={analyzing}
              className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/80 px-3.5 py-2 text-[12.5px] font-medium text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600 disabled:opacity-60"
            >
              {analyzing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {profile?.exists ? 'Re-analyze' : 'Analyze my blog'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {profile?.exists ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="glass rounded-3xl p-5 sm:col-span-2">
                  <p className="text-[14px] font-medium leading-relaxed text-ink-900">
                    {profile.niche}
                  </p>
                  {profile.audience ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
                      <span className="font-medium text-ink-700">Audience:</span>{' '}
                      {profile.audience}
                    </p>
                  ) : null}
                  {profile.toneSummary ? (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                      <span className="font-medium text-ink-700">Voice:</span>{' '}
                      {profile.toneSummary}
                    </p>
                  ) : null}
                  {profile.recurringThemes?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {profile.recurringThemes.map((theme) => (
                        <Badge key={theme}>{theme}</Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                {profile.styleNotes?.length ? (
                  <div className="glass rounded-3xl p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                      <PenLine className="h-4 w-4 text-brand-500" />
                      House style it will copy
                    </h3>
                    <ul className="space-y-2">
                      {profile.styleNotes.map((note, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {profile.contentGaps?.length ? (
                  <div className="glass rounded-3xl p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                      <Lightbulb className="h-4 w-4 text-brand-500" />
                      Gaps worth filling
                    </h3>
                    <ul className="space-y-2">
                      {profile.contentGaps.map((gap, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-glow" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-8 text-center"
              >
                <Target className="mx-auto mb-3 h-8 w-8 text-brand-200" />
                <p className="text-[13.5px] text-ink-600">
                  {ready} page{ready === 1 ? '' : 's'} crawled. Analyze them to learn your
                  niche, house style, and what to write next.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      ) : null}

      {/* Suggested topics */}
      {profile?.suggestedTopics?.length ? (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 px-1 text-[15px] font-semibold tracking-tight text-ink-900">
            <Lightbulb className="h-4.5 w-4.5 text-brand-500" />
            What to write next
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.suggestedTopics.map((topic, index) => (
              <div
                key={index}
                className="glass animate-rise group flex flex-col rounded-3xl p-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <h3 className="text-[14px] font-semibold leading-snug tracking-tight text-ink-900">
                  {topic.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
                  {topic.angle}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(topic.keywords ?? []).map((k) => (
                    <Badge key={k} tone="neutral">
                      {k}
                    </Badge>
                  ))}
                </div>
                <button
                  onClick={() => writeTopic(topic.title, topic.keywords ?? [])}
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2.5 text-[12.5px] font-semibold text-brand-600 ring-1 ring-brand-100 transition-all hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Write this one
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Sources */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
            Crawled pages
          </h2>
          <div className="flex items-center gap-1.5">
            {list?.ready ? <Badge tone="success">{list.ready} ready</Badge> : null}
            {list?.pending ? (
              <Badge tone="brand">{list.pending} crawling</Badge>
            ) : null}
            {list?.failed ? <Badge tone="danger">{list.failed} failed</Badge> : null}
          </div>
        </div>

        {!list?.items.length ? (
          <div className="glass rounded-3xl p-10 text-center">
            <Globe className="mx-auto mb-3 h-8 w-8 text-brand-200" />
            <p className="text-[13.5px] text-ink-500">
              Nothing crawled yet. Add your blog URL above to get started.
            </p>
          </div>
        ) : (
          <div className="glass divide-y divide-hairline overflow-hidden rounded-3xl">
            {list.items.map((source) => (
              <div
                key={source.id}
                className="group flex items-center gap-3 p-4 transition-colors hover:bg-white/50"
              >
                <span className="shrink-0">
                  {source.status === 'ready' ? (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Check className="h-4 w-4" strokeWidth={2.6} />
                    </span>
                  ) : source.status === 'failed' ? (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500">
                      <TriangleAlert className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink-900">
                    {source.title || source.url}
                  </p>
                  <p className="truncate text-[11.5px] text-ink-400">
                    {source.url}
                    {source.wordCount > 0
                      ? ` · ${source.wordCount.toLocaleString()} words`
                      : ''}
                    {source.discoveredFrom ? ' · discovered' : ''}
                  </p>
                  {source.error ? (
                    <p className="mt-0.5 truncate text-[11.5px] text-rose-500">
                      {source.error}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    title="Open"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => recrawl(source.id)}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    title="Re-crawl"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
