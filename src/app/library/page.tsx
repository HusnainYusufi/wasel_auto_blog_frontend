'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LibraryBig, Loader2, PenLine, Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogSummary } from '@/lib/types';
import { BlogCard } from '@/components/BlogCard';
import { TextInput } from '@/components/ui';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Awaiting review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
] as const;

export default function LibraryPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .list({ reviewStatus: status || undefined, take: 60 })
      .then((data) => {
        if (!cancelled) {
          setBlogs(data.items);
          setCounts(data.reviewCounts);
        }
      })
      .catch(() => {
        if (!cancelled) setBlogs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return blogs;
    return blogs.filter(
      (b) =>
        (b.title ?? '').toLowerCase().includes(query) ||
        b.topic.toLowerCase().includes(query) ||
        b.keywords.some((k) => k.toLowerCase().includes(query)),
    );
  }, [blogs, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-ink-900">
            <LibraryBig className="h-6 w-6 text-brand-500" />
            Library
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            {counts.pending} awaiting review · {counts.approved} approved ·{' '}
            {counts.rejected} rejected
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/35"
        >
          <PenLine className="h-4 w-4" />
          New article
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[15rem] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, topics, keywords…"
            className="pl-10"
          />
        </div>

        <div className="glass flex gap-1 rounded-xl p-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatus(filter.key)}
              className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-200 ${
                status === filter.key
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'text-ink-500 hover:bg-white hover:text-ink-800'
              }`}
            >
              {filter.label}
              {filter.key && counts[filter.key as keyof typeof counts] > 0 ? (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    status === filter.key ? 'bg-white/25' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {counts[filter.key as keyof typeof counts]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-24 text-ink-400">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass grid place-items-center rounded-3xl py-20 text-center">
          <LibraryBig className="mb-3 h-9 w-9 text-brand-200" />
          <p className="text-[14.5px] font-medium text-ink-800">Nothing here yet</p>
          <p className="mt-1 max-w-xs text-[13px] text-ink-500">
            Generate your first article from the studio and it will show up here.
          </p>
          <Link
            href="/"
            className="mt-5 rounded-xl bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-transform hover:scale-[1.02]"
          >
            Open the studio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
