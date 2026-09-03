'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, RotateCcw, TriangleAlert } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogDetail } from '@/lib/types';
import { GenerationStage } from '@/components/GenerationStage';
import { ArticleView } from '@/components/ArticleView';

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get(id);
      setBlog(data);
      setLoadError(null);
    } catch (error) {
      setLoadError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid place-items-center py-40">
        <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
      </div>
    );
  }

  if (loadError || !blog) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-rose-300" />
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">
          Article not found
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-500">
          {loadError ?? 'This article may have been deleted.'}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25"
        >
          Back to the studio
        </Link>
      </div>
    );
  }

  if (blog.status === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-28 text-center">
        <div className="glass-strong rounded-4xl p-8">
          <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-rose-400" />
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">
            Generation failed
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
            {blog.error ?? 'Something went wrong during generation.'}
          </p>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-left text-[12.5px] text-ink-600">
            <strong className="text-ink-800">Topic:</strong> {blog.topic}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25 transition-transform hover:scale-[1.02]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if (blog.status !== 'completed') {
    return (
      <GenerationStage
        blogId={blog.id}
        topic={blog.topic}
        initialEvents={blog.events}
        onComplete={load}
      />
    );
  }

  return <ArticleView blog={blog} onRefresh={load} />;
}
