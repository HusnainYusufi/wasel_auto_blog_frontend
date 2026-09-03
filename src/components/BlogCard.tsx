'use client';

import Link from 'next/link';
import { Clock, FileText, Loader2, TriangleAlert } from 'lucide-react';
import type { BlogSummary } from '@/lib/types';
import { Badge } from './ui';

export function BlogCard({ blog, index = 0 }: { blog: BlogSummary; index?: number }) {
  const running = blog.status === 'running' || blog.status === 'queued';

  return (
    <Link
      href={`/blog/${blog.id}`}
      className="animate-rise glass group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_-32px_rgba(36,112,221,0.45)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
        {blog.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.heroImageUrl}
            alt={blog.title ?? blog.topic}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center">
            {running ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
            ) : blog.status === 'failed' ? (
              <TriangleAlert className="h-6 w-6 text-rose-400" />
            ) : (
              <FileText className="h-6 w-6 text-brand-300" />
            )}
          </div>
        )}

        <div className="absolute left-3 top-3">
          {blog.status === 'completed' ? (
            <Badge
              tone={
                blog.reviewStatus === 'approved'
                  ? 'success'
                  : blog.reviewStatus === 'rejected'
                    ? 'danger'
                    : 'neutral'
              }
            >
              {blog.reviewStatus === 'approved'
                ? 'Approved'
                : blog.reviewStatus === 'rejected'
                  ? 'Rejected'
                  : 'Awaiting review'}
            </Badge>
          ) : blog.status === 'failed' ? (
            <Badge tone="danger">Failed</Badge>
          ) : (
            <Badge tone="brand">{blog.progress}% · generating</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[14.5px] font-semibold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-brand-600">
          {blog.title || blog.topic}
        </h3>

        {blog.metaDescription ? (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">
            {blog.metaDescription}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[11px] text-ink-400">
          {blog.wordCount > 0 ? (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {blog.wordCount.toLocaleString()} words
            </span>
          ) : null}
          {blog.readingMinutes > 0 ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {blog.readingMinutes} min
            </span>
          ) : null}
          <span className="ml-auto">
            {new Date(blog.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
