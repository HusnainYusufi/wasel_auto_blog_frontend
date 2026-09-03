'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { BlogSummary } from '@/lib/types';
import { BlogCard } from './BlogCard';

export function RecentStrip() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);

  useEffect(() => {
    api
      .list({ take: 3 })
      .then((data) => setBlogs(data.items))
      .catch(() => setBlogs([]));
  }, []);

  if (!blogs.length) return null;

  return (
    <section className="mx-auto mt-16 max-w-5xl">
      <div className="mb-4 flex items-baseline justify-between px-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          Recently generated
        </h2>
        <Link
          href="/library"
          className="group flex items-center gap-1 text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          View library
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {blogs.map((blog, index) => (
          <BlogCard key={blog.id} blog={blog} index={index} />
        ))}
      </div>
    </section>
  );
}
