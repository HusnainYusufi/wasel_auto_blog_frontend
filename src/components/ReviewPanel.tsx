'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Clock,
  FileText,
  History,
  Loader2,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AuditEntry, ReviewStatus } from '@/lib/types';

const ACTION_STYLE: Record<string, { label: string; icon: React.ElementType; tone: string }> = {
  created: { label: 'Generation started', icon: FileText, tone: 'text-ink-400 bg-white' },
  completed: { label: 'Article completed', icon: Check, tone: 'text-brand-600 bg-brand-50' },
  failed: { label: 'Generation failed', icon: TriangleAlert, tone: 'text-rose-500 bg-rose-50' },
  approved: { label: 'Approved', icon: ShieldCheck, tone: 'text-emerald-600 bg-emerald-50' },
  rejected: { label: 'Rejected', icon: X, tone: 'text-rose-600 bg-rose-50' },
  reopened: { label: 'Reopened for review', icon: RotateCcw, tone: 'text-brand-600 bg-brand-50' },
};

export function ReviewPanel({
  blogId,
  reviewStatus,
  reviewNote,
  onChanged,
}: {
  blogId: string;
  reviewStatus: ReviewStatus;
  reviewNote: string | null;
  onChanged: () => void;
}) {
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [note, setNote] = useState('');
  const [composing, setComposing] = useState<'approve' | 'reject' | null>(null);
  const [busy, setBusy] = useState(false);

  const loadHistory = () => {
    api
      .history(blogId)
      .then(setHistory)
      .catch(() => setHistory([]));
  };

  useEffect(loadHistory, [blogId]);

  const decide = async (decision: 'approve' | 'reject') => {
    setBusy(true);
    try {
      if (decision === 'approve') await api.approve(blogId, note.trim() || undefined);
      else await api.reject(blogId, note.trim() || undefined);

      toast.success(decision === 'approve' ? 'Article approved' : 'Article rejected');
      setNote('');
      setComposing(null);
      loadHistory();
      onChanged();
    } catch (error) {
      toast.error('Could not save the decision', {
        description: (error as Error).message,
      });
    } finally {
      setBusy(false);
    }
  };

  const reopen = async () => {
    setBusy(true);
    try {
      await api.reopen(blogId);
      toast.success('Sent back to the review queue');
      loadHistory();
      onChanged();
    } catch (error) {
      toast.error('Could not reopen', { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Decision */}
      <section className="glass-strong rounded-3xl p-5 sm:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-ink-900">
            <ShieldCheck className="h-4.5 w-4.5 text-brand-500" />
            Editorial decision
          </h3>
          <StatusPill status={reviewStatus} />
        </div>

        {reviewNote ? (
          <p className="mb-4 rounded-xl bg-white/70 px-4 py-3 text-[12.5px] leading-relaxed text-ink-600 ring-1 ring-hairline">
            <span className="font-medium text-ink-800">Note:</span> {reviewNote}
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          {composing ? (
            <motion.div
              key="composing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                autoFocus
                maxLength={500}
                placeholder={
                  composing === 'approve'
                    ? 'Optional note — why this is good to publish'
                    : 'Optional note — what needs to change'
                }
                className="w-full resize-none rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => decide(composing)}
                  disabled={busy}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg transition-all disabled:opacity-60 ${
                    composing === 'approve'
                      ? 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-600'
                      : 'bg-rose-500 shadow-rose-500/25 hover:bg-rose-600'
                  }`}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : composing === 'approve' ? (
                    <Check className="h-4 w-4" strokeWidth={2.6} />
                  ) : (
                    <X className="h-4 w-4" strokeWidth={2.6} />
                  )}
                  Confirm {composing === 'approve' ? 'approval' : 'rejection'}
                </button>
                <button
                  onClick={() => {
                    setComposing(null);
                    setNote('');
                  }}
                  className="rounded-xl border border-hairline bg-white/70 px-4 py-2.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2"
            >
              {reviewStatus !== 'approved' ? (
                <button
                  onClick={() => setComposing('approve')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl"
                >
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                  Keep this article
                </button>
              ) : null}

              {reviewStatus !== 'rejected' ? (
                <button
                  onClick={() => setComposing('reject')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-hairline bg-white/80 px-4 py-3 text-[13.5px] font-semibold text-ink-600 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X className="h-4 w-4" strokeWidth={2.6} />
                  Reject
                </button>
              ) : null}

              {reviewStatus !== 'pending' ? (
                <button
                  onClick={reopen}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white/80 px-4 py-3 text-[13.5px] font-medium text-ink-500 transition-all hover:border-brand-300 hover:text-brand-600 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Reopen
                </button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* History */}
      <section className="glass rounded-3xl p-5 sm:col-span-2">
        <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-tight text-ink-900">
          <History className="h-4 w-4 text-brand-500" />
          History
        </h3>

        {!history.length ? (
          <p className="text-[12.5px] text-ink-400">No activity recorded yet.</p>
        ) : (
          <ol className="relative space-y-4 pl-1">
            {history.map((entry, index) => {
              const style = ACTION_STYLE[entry.action] ?? {
                label: entry.action,
                icon: FileText,
                tone: 'text-ink-400 bg-white',
              };
              const Icon = style.icon;

              return (
                <li key={entry.id} className="relative flex gap-3.5">
                  {index < history.length - 1 ? (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-hairline" />
                  ) : null}

                  <span
                    className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-hairline ${style.tone}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>

                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-[13px] font-medium text-ink-900">{style.label}</p>
                    {entry.note ? (
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">
                        {entry.note}
                      </p>
                    ) : null}
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.user ? ` · ${entry.user.name}` : ''}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

export function StatusPill({ status }: { status: ReviewStatus }) {
  const map = {
    pending: { label: 'Awaiting review', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
    rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold ring-1 ${map.className}`}
    >
      {map.label}
    </span>
  );
}
