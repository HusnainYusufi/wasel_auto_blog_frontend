'use client';

import { Copy, Gauge, Hash, Lightbulb, Link2, MessageSquareQuote, Tags } from 'lucide-react';
import { toast } from 'sonner';
import type { SeoData } from '@/lib/types';
import { Badge } from './ui';

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Clipboard unavailable'),
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink-900">
        <Icon className="h-4 w-4 text-brand-500" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function SeoPanel({ seo }: { seo: SeoData | null }) {
  if (!seo) {
    return (
      <div className="glass rounded-3xl p-8 text-center text-[13.5px] text-ink-500">
        No SEO data was captured for this article.
      </div>
    );
  }

  const score = Math.round(seo.seoScore ?? 0);
  const scoreTone = score >= 80 ? '#16a34a' : score >= 60 ? '#2470dd' : '#e11d48';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Score */}
      <section className="glass-strong flex items-center gap-5 rounded-3xl p-6 sm:col-span-2">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e0efff" strokeWidth="9" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={scoreTone}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </svg>
          <span className="absolute text-xl font-bold tabular-nums text-ink-900">{score}</span>
        </div>

        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink-900">
            <Gauge className="h-4 w-4 text-brand-500" />
            On-page SEO score
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            Primary keyword <strong className="text-ink-800">{seo.primaryKeyword}</strong>
            {seo.searchIntent ? ` · ${seo.searchIntent} intent` : ''}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(seo.categories ?? []).map((c) => (
              <Badge key={c} tone="neutral">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Keyword density */}
      {seo.keywordDensity?.length ? (
        <Card title="Keyword coverage" icon={Hash}>
          <ul className="space-y-2.5">
            {seo.keywordDensity.slice(0, 8).map((entry) => (
              <li key={entry.keyword}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[12.5px] text-ink-700">{entry.keyword}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
                    {entry.count}× · {entry.density}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-brand-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-glow"
                    style={{ width: `${Math.min(entry.density * 20, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Tags */}
      <Card title="Tags" icon={Tags}>
        <div className="flex flex-wrap gap-1.5">
          {(seo.tags ?? []).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {(seo.secondaryKeywords ?? []).map((keyword) => (
            <Badge key={keyword} tone="neutral">
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Social copy */}
      {seo.twitterPost || seo.linkedinPost ? (
        <Card title="Social copy" icon={MessageSquareQuote}>
          <div className="space-y-3">
            {seo.twitterPost ? (
              <div className="group rounded-2xl bg-white/70 p-3.5 ring-1 ring-hairline">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    X / Twitter
                  </span>
                  <button
                    onClick={() => copy(seo.twitterPost!, 'Post')}
                    className="rounded-md p-1 text-ink-400 opacity-0 transition-all hover:bg-brand-50 hover:text-brand-600 group-hover:opacity-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-700">{seo.twitterPost}</p>
              </div>
            ) : null}

            {seo.linkedinPost ? (
              <div className="group rounded-2xl bg-white/70 p-3.5 ring-1 ring-hairline">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    LinkedIn
                  </span>
                  <button
                    onClick={() => copy(seo.linkedinPost!, 'Post')}
                    className="rounded-md p-1 text-ink-400 opacity-0 transition-all hover:bg-brand-50 hover:text-brand-600 group-hover:opacity-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-700">{seo.linkedinPost}</p>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {/* Improvements */}
      {seo.improvementTips?.length ? (
        <Card title="Ranking opportunities" icon={Lightbulb}>
          <ul className="space-y-2">
            {seo.improvementTips.map((tip, index) => (
              <li key={index} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Internal links */}
      {seo.internalLinkIdeas?.length ? (
        <Card title="Internal link ideas" icon={Link2}>
          <ul className="space-y-2">
            {seo.internalLinkIdeas.map((idea, index) => (
              <li key={index} className="flex gap-2.5 text-[12.5px] leading-relaxed text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-glow" />
                {idea}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Structured data */}
      {seo.jsonLd ? (
        <section className="glass rounded-3xl p-5 sm:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink-900">
              <Hash className="h-4 w-4 text-brand-500" />
              JSON-LD structured data
            </h3>
            <button
              onClick={() => copy(JSON.stringify(seo.jsonLd, null, 2), 'JSON-LD')}
              className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-ink-600 ring-1 ring-hairline transition-colors hover:text-brand-600"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          </div>
          <pre className="max-h-64 overflow-auto rounded-2xl bg-ink-900 p-4 text-[11.5px] leading-relaxed text-brand-100">
            {JSON.stringify(seo.jsonLd, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
