'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  CircleDashed,
  Compass,
  Gauge,
  ImagePlus,
  Loader2,
  PenLine,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ProgressEvent } from '@/lib/types';

const STEPS = [
  { key: 'blueprint', label: 'Blueprint', hint: 'Intent, keywords, section plan', icon: Compass },
  { key: 'writing', label: 'Draft', hint: 'Long-form copy, section by section', icon: PenLine },
  { key: 'images', label: 'Imagery', hint: 'Hero and in-body visuals', icon: ImagePlus },
  { key: 'seo', label: 'SEO audit', hint: 'Score, tags, social copy', icon: Gauge },
  { key: 'assemble', label: 'Assemble', hint: 'Schema, exports, final polish', icon: Sparkles },
];

type StepState = 'pending' | 'active' | 'done' | 'failed';

export function GenerationStage({
  blogId,
  topic,
  initialEvents,
  onComplete,
}: {
  blogId: string;
  topic: string;
  initialEvents: ProgressEvent[];
  onComplete: () => void;
}) {
  const [events, setEvents] = useState<ProgressEvent[]>(initialEvents);
  const [progress, setProgress] = useState(
    initialEvents.length ? initialEvents[initialEvents.length - 1].progress : 2,
  );
  const [failure, setFailure] = useState<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const source = new EventSource(api.streamUrl(blogId));

    source.onmessage = (message) => {
      let event: ProgressEvent;
      try {
        event = JSON.parse(message.data) as ProgressEvent;
      } catch {
        return;
      }

      setProgress(event.progress);
      setEvents((prev) =>
        prev.some(
          (e) => e.createdAt === event.createdAt && e.message === event.message,
        )
          ? prev
          : [...prev, event],
      );

      if (event.step === 'failed') {
        setFailure(event.message);
        source.close();
      } else if (event.step === 'done' && !completedRef.current) {
        completedRef.current = true;
        source.close();
        // Let the 100% bar settle before swapping in the article.
        setTimeout(onComplete, 700);
      }
    };

    source.onerror = () => source.close();

    return () => source.close();
  }, [blogId, onComplete]);

  const stepStates = useMemo(() => {
    const states: Record<string, StepState> = {};
    for (const step of STEPS) states[step.key] = 'pending';

    for (const event of events) {
      if (event.step === 'failed') {
        const active = Object.entries(states).find(([, s]) => s === 'active');
        if (active) states[active[0]] = 'failed';
        continue;
      }
      if (!(event.step in states)) continue;
      states[event.step] = event.status === 'done' ? 'done' : 'active';
    }
    return states;
  }, [events]);

  const latest = events.length ? events[events.length - 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500 to-sky-glow opacity-20 blur-xl" />
          <span className="relative grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-sky-glow shadow-xl shadow-brand-500/30">
            {failure ? (
              <TriangleAlert className="h-7 w-7 text-white" />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin text-white" strokeWidth={2.2} />
            )}
          </span>
          {!failure ? (
            <span className="animate-pulse-ring absolute inset-0 rounded-3xl border-2 border-brand-400" />
          ) : null}
        </div>

        <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight text-ink-900 sm:text-3xl">
          {failure ? 'Generation stopped' : 'Writing your article'}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-500">
          {failure ?? topic}
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-strong rounded-3xl p-6">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[12.5px] font-medium text-ink-600">
            {latest?.message ?? 'Warming up the pipeline…'}
          </span>
          <span className="text-[13px] font-semibold tabular-nums text-brand-600">
            {progress}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <motion.div
            className={`h-full rounded-full ${
              failure
                ? 'bg-rose-400'
                : 'bg-gradient-to-r from-brand-600 via-brand-500 to-sky-glow'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Step rail */}
        <ol className="mt-6 space-y-1">
          {STEPS.map((step) => {
            const state = stepStates[step.key];
            const Icon = step.icon;

            return (
              <li
                key={step.key}
                className={`flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-all duration-500 ${
                  state === 'active' ? 'bg-brand-50/80 ring-1 ring-brand-100' : ''
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all duration-500 ${
                    state === 'done'
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : state === 'active'
                        ? 'bg-white text-brand-600 shadow-md shadow-brand-500/15 ring-1 ring-brand-200'
                        : state === 'failed'
                          ? 'bg-rose-100 text-rose-500'
                          : 'bg-white/60 text-ink-400 ring-1 ring-hairline'
                  }`}
                >
                  {state === 'done' ? (
                    <Check className="h-4.5 w-4.5" strokeWidth={2.6} />
                  ) : state === 'active' ? (
                    <Icon className="h-4.5 w-4.5 animate-pulse" strokeWidth={2.1} />
                  ) : state === 'failed' ? (
                    <TriangleAlert className="h-4.5 w-4.5" />
                  ) : (
                    <CircleDashed className="h-4.5 w-4.5" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[13.5px] font-semibold tracking-tight transition-colors ${
                      state === 'pending' ? 'text-ink-400' : 'text-ink-900'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-400">
                    {step.hint}
                  </span>
                </span>

                {state === 'active' ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-400" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Live log */}
      <div className="mt-5 space-y-1.5">
        <AnimatePresence initial={false}>
          {events
            .slice(-4)
            .reverse()
            .map((event, index) => (
              <motion.div
                key={`${event.createdAt}-${event.message}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1 - index * 0.22, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2.5 rounded-xl bg-white/50 px-3.5 py-2 text-[12px] text-ink-500 backdrop-blur-sm"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    event.status === 'done'
                      ? 'bg-brand-500'
                      : event.status === 'failed'
                        ? 'bg-rose-400'
                        : 'bg-sky-glow'
                  }`}
                />
                <span className="truncate">{event.message}</span>
                <span className="ml-auto shrink-0 tabular-nums text-ink-400">
                  {new Date(event.createdAt).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Skeleton preview */}
      {!failure ? (
        <div className="glass mt-8 space-y-3 rounded-3xl p-6">
          <div className="shimmer-bg h-6 w-3/4 rounded-lg bg-brand-50" />
          <div className="shimmer-bg h-3 w-full rounded bg-brand-50" />
          <div className="shimmer-bg h-3 w-11/12 rounded bg-brand-50" />
          <div className="shimmer-bg h-40 w-full rounded-2xl bg-brand-50" />
          <div className="shimmer-bg h-3 w-full rounded bg-brand-50" />
          <div className="shimmer-bg h-3 w-4/5 rounded bg-brand-50" />
        </div>
      ) : null}
    </div>
  );
}
