import { Suspense } from 'react';
import { GeneratorForm } from '@/components/GeneratorForm';
import { RecentStrip } from '@/components/RecentStrip';
import { Sparkles } from 'lucide-react';

const CAPABILITIES = [
  { title: 'Search-first blueprint', body: 'Intent, keyword map, and a non-repetitive section plan before a single word is written.' },
  { title: 'Original imagery', body: 'A hero plus in-body visuals rendered by image-01 and stored with your post — no stock libraries.' },
  { title: 'Ready to publish', body: 'Meta tags, FAQ schema, JSON-LD, social copy, and Markdown or HTML export in one pass.' },
];

export default function StudioPage() {
  return (
    <div className="px-4 pb-24 pt-14 sm:pt-20">
      {/* Hero */}
      <section className="mx-auto mb-10 max-w-3xl text-center">
        <span className="animate-rise inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1.5 text-[12px] font-medium text-brand-600 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by MiniMax M-series + image-01
        </span>

        <h1
          className="animate-rise text-gradient mt-5 text-[2.6rem] font-bold leading-[1.08] tracking-[-0.03em] sm:text-6xl"
          style={{ animationDelay: '80ms' }}
        >
          Publish-ready articles,
          <br />
          generated end to end.
        </h1>

        <p
          className="animate-rise mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink-500 sm:text-base"
          style={{ animationDelay: '160ms' }}
        >
          Give it a topic and a few keywords. You get a structured, SEO-tuned long-form
          post with original imagery, metadata, and exports — in about two minutes.
        </p>
      </section>

      <Suspense fallback={<div className="glass-strong mx-auto h-[42rem] w-full max-w-3xl rounded-4xl" />}>
        <GeneratorForm />
      </Suspense>

      {/* Capabilities */}
      <section className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
        {CAPABILITIES.map((item, index) => (
          <div
            key={item.title}
            className="animate-rise glass rounded-3xl p-5"
            style={{ animationDelay: `${240 + index * 90}ms` }}
          >
            <span className="mb-3 block h-1 w-9 rounded-full bg-gradient-to-r from-brand-500 to-sky-glow" />
            <h3 className="text-[14.5px] font-semibold tracking-tight text-ink-900">
              {item.title}
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{item.body}</p>
          </div>
        ))}
      </section>

      <RecentStrip />
    </div>
  );
}
