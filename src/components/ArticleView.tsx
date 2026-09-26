'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  Code2,
  Copy,
  Download,
  FileText,
  Gauge,
  ImageIcon,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Trash2,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { BlogDetail } from '@/lib/types';
import { slugify, textOf } from '@/lib/slug';
import { SeoPanel } from './SeoPanel';
import { ReviewPanel, StatusPill } from './ReviewPanel';
import { Badge } from './ui';

const TABS = [
  { key: 'article', label: 'Article', icon: FileText },
  { key: 'review', label: 'Review', icon: ShieldCheck },
  { key: 'seo', label: 'SEO', icon: Gauge },
  { key: 'images', label: 'Images', icon: ImageIcon },
  { key: 'markdown', label: 'Markdown', icon: Code2 },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function ArticleView({
  blog,
  onRefresh,
}: {
  blog: BlogDetail;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('article');
  // Which language body is on screen. 'alt' only exists on bilingual articles.
  const [lang, setLang] = useState<'main' | 'alt'>('main');

  // The hero renders the title, so the body starts after the leading H1.
  const showingAlt = lang === 'alt' && !!blog.altContentMarkdown;
  const activeMarkdown =
    (showingAlt ? blog.altContentMarkdown : blog.contentMarkdown) ?? '';
  const body = activeMarkdown.replace(/^\s*#\s+.*(?:\n+|$)/, '');

  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error('Clipboard unavailable'),
    );
  };

  const regenerate = async (imageId: string) => {
    setRegenerating(imageId);
    try {
      await api.regenerateImage(blog.id, imageId);
      toast.success('New image rendered');
      onRefresh();
    } catch (error) {
      toast.error('Could not regenerate', { description: (error as Error).message });
    } finally {
      setRegenerating(null);
    }
  };

  const destroy = async () => {
    if (!confirm('Delete this article and its images permanently?')) return;
    setDeleting(true);
    try {
      await api.remove(blog.id);
      toast.success('Article deleted');
      window.location.href = '/library';
    } catch (error) {
      toast.error('Delete failed', { description: (error as Error).message });
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      {/* Back + actions */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/library"
          className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/70 px-3 py-2 text-[12.5px] font-medium text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Library
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => copyText(activeMarkdown, 'Markdown')}
            className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/70 px-3 py-2 text-[12.5px] font-medium text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy MD
          </button>

          <a
            href={api.exportUrl(blog.id, 'md')}
            className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/70 px-3 py-2 text-[12.5px] font-medium text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600"
          >
            <Download className="h-3.5 w-3.5" />
            .md
          </a>
          <a
            href={api.exportUrl(blog.id, 'html')}
            className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/70 px-3 py-2 text-[12.5px] font-medium text-ink-600 transition-all hover:border-brand-300 hover:text-brand-600"
          >
            <Download className="h-3.5 w-3.5" />
            .html
          </a>

          <button
            onClick={destroy}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-xl border border-hairline bg-white/70 px-3 py-2 text-[12.5px] font-medium text-ink-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong overflow-hidden rounded-4xl"
      >
        {blog.heroImageUrl ? (
          <div className="relative aspect-[21/9] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.heroImageUrl}
              alt={blog.title ?? blog.topic}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>
        ) : null}

        <div className={`p-6 sm:p-8 ${blog.heroImageUrl ? '-mt-12 relative' : ''}`}>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <StatusPill status={blog.reviewStatus} />
            {blog.keywords.slice(0, 3).map((keyword) => (
              <Badge key={keyword}>{keyword}</Badge>
            ))}
          </div>

          <h1
            dir="auto"
            className="bidi text-[1.9rem] font-bold leading-[1.12] tracking-[-0.028em] text-ink-900 sm:text-[2.5rem]"
          >
            {showingAlt ? (blog.altTitle ?? blog.title) : blog.title}
          </h1>

          {/* Only bilingual articles get a language switch. */}
          {blog.altContentMarkdown ? (
            <div className="mt-4 inline-flex rounded-xl bg-white/70 p-1 ring-1 ring-hairline">
              {(
                [
                  ['main', blog.language],
                  ['alt', blog.altLanguage ?? 'Alt'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setLang(key)}
                  className={`rounded-lg px-4 py-1.5 text-[12.5px] font-medium transition-all ${
                    lang === key
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                      : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {blog.metaDescription ? (
            <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-500">
              {blog.metaDescription}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-4 text-[12px] text-ink-400">
            <span className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              {blog.wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {blog.readingMinutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              {blog.images.length} images
            </span>
            <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-600">
              {blog.textProvider === 'gemini' ? 'Gemini' : 'MiniMax'} · {blog.textModel}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className="glass sticky top-[4.75rem] z-30 mt-6 flex gap-1 rounded-2xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition-all duration-300 ${
              tab === key
                ? 'bg-white text-brand-600 shadow-sm shadow-brand-500/15 ring-1 ring-brand-100'
                : 'text-ink-500 hover:bg-white/60 hover:text-ink-800'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6"
      >
        {tab === 'article' ? (
          <article className="glass-strong rounded-4xl p-6 sm:p-10">
            <div className="prose-article">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 id={slugify(textOf(children))}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 id={slugify(textOf(children))}>{children}</h3>
                  ),
                  table: ({ children }) => (
                    <div className="table-scroll">
                      <table>{children}</table>
                    </div>
                  ),
                  // Markdown wraps images in a paragraph; <figure> inside <p> is
                  // invalid HTML, so an image-only paragraph becomes the figure.
                  p: ({ node, children }) => {
                    const only =
                      node?.children?.length === 1 ? node.children[0] : null;

                    if (only && only.type === 'element' && only.tagName === 'img') {
                      const { src, alt, title } = only.properties as {
                        src?: string;
                        alt?: string;
                        title?: string;
                      };
                      return (
                        <figure>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={String(src ?? '')} alt={alt ?? ''} loading="lazy" />
                          {title ? <figcaption>{title}</figcaption> : null}
                        </figure>
                      );
                    }

                    return <p>{children}</p>;
                  },
                }}
              >
                {body}
              </ReactMarkdown>
            </div>
          </article>
        ) : null}

        {tab === 'review' ? (
          <ReviewPanel
            blogId={blog.id}
            reviewStatus={blog.reviewStatus}
            reviewNote={blog.reviewNote}
            onChanged={onRefresh}
          />
        ) : null}

        {tab === 'seo' ? <SeoPanel seo={blog.seo} /> : null}

        {tab === 'images' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {blog.images.length === 0 ? (
              <div className="glass col-span-full rounded-3xl p-10 text-center text-[13.5px] text-ink-500">
                This article was generated without images.
              </div>
            ) : (
              blog.images.map((image) => (
                <figure key={image.id} className="glass overflow-hidden rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <figcaption className="space-y-2.5 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={image.role === 'hero' ? 'brand' : 'neutral'}>
                        {image.role} · {image.aspectRatio}
                      </Badge>
                      <button
                        onClick={() => regenerate(image.id)}
                        disabled={regenerating === image.id}
                        className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-hairline transition-colors hover:text-brand-600 disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${regenerating === image.id ? 'animate-spin' : ''}`}
                        />
                        Regenerate
                      </button>
                    </div>
                    <p className="text-[12px] leading-relaxed text-ink-500">{image.prompt}</p>
                    <p className="text-[11px] text-ink-400">Alt: {image.alt}</p>
                  </figcaption>
                </figure>
              ))
            )}
          </div>
        ) : null}

        {tab === 'markdown' ? (
          <div className="glass-strong rounded-4xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-ink-600">
                Raw Markdown · {activeMarkdown.split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText(activeMarkdown, 'Markdown')}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-hairline transition-colors hover:text-brand-600"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
                <a
                  href={api.exportUrl(blog.id, 'json')}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-hairline transition-colors hover:text-brand-600"
                >
                  <Download className="h-3 w-3" />
                  JSON
                </a>
              </div>
            </div>
            <pre className="max-h-[38rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-ink-900 p-5 text-[12.5px] leading-relaxed text-brand-100">
              {activeMarkdown}
            </pre>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
