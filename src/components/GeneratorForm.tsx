'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  PenLine,
  Settings2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { GeneratorOptions, KnowledgeProfile, TextProviderOption } from '@/lib/types';
import { Field, SegmentedControl, Select, TextArea, TextInput, Toggle } from './ui';
import { KeywordInput } from './KeywordInput';
import { KeywordSetPicker } from './KeywordSetPicker';
import { parseProductLines } from '@/lib/slug';


const LANGUAGES = [
  'English',
  'Arabic',
  'French',
  'Spanish',
  'German',
  'Portuguese',
  'Turkish',
  'Urdu',
  'Hindi',
  'Indonesian',
];

const TOPIC_IDEAS = [
  'How AI voice agents are reshaping customer support',
  'A practical guide to technical SEO for SaaS teams',
  'Choosing between serverless and containers in 2026',
  'Building a design system that engineers actually use',
];

const LENGTH_SUB: Record<string, string> = {
  brief: '~800 words',
  standard: '~1,500 words',
  indepth: '~2,400 words',
  pillar: '~3,200 words',
};

export function GeneratorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<GeneratorOptions | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [lengthPreset, setLengthPreset] = useState('standard');
  const [pointOfView, setPointOfView] = useState('second-person');
  const [brandName, setBrandName] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [imageCount, setImageCount] = useState(3);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageStyle, setImageStyle] = useState('modern editorial photography');
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);
  const [textModel, setTextModel] = useState('');
  const [textProvider, setTextProvider] = useState<string>('');
  const [keywordSetIds, setKeywordSetIds] = useState<string[]>([]);
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [altLanguage, setAltLanguage] = useState('');
  const [altTopic, setAltTopic] = useState('');
  const [brandUrl, setBrandUrl] = useState('');
  const [productsText, setProductsText] = useState('');
  const [knowledge, setKnowledge] = useState<KnowledgeProfile | null>(null);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);

  useEffect(() => {
    api
      .options()
      .then((data) => {
        setOptions(data);
        setTextProvider(data.defaults.textProvider ?? '');
        setTextModel(data.defaults.textModel ?? '');
      })
      .catch(() =>
        toast.error('Could not reach the API', {
          description: 'Make sure the backend is running.',
        }),
      );

    api
      .knowledge.profile()
      .then((profile) => {
        setKnowledge(profile);
        // Default to on when there is something to learn from.
        if (profile.readyCount > 0) setUseKnowledgeBase(true);
      })
      .catch(() => setKnowledge(null));
  }, []);

  // Prefilled by "Write this one" on the knowledge page.
  useEffect(() => {
    const presetTopic = searchParams.get('topic');
    const presetKeywords = searchParams.get('keywords');
    if (presetTopic) setTopic(presetTopic.slice(0, 300));
    if (presetKeywords) {
      setKeywords(
        presetKeywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
          .slice(0, 50),
      );
    }
  }, [searchParams]);

  const activeProvider: TextProviderOption | undefined =
    options?.textProviders.find((p) => p.id === textProvider);

  const submit = async () => {
    if (topic.trim().length < 3) {
      toast.error('Give your article a topic first');
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await api.generate({
        topic: topic.trim(),
        keywords,
        keywordSetIds,
        secondaryKeywords,
        altLanguage: altLanguage || undefined,
        altTopic: altTopic.trim() || undefined,
        brandUrl: brandUrl.trim() || undefined,
        productLinks: parseProductLines(productsText),
        language,
        tone,
        audience: audience.trim() || 'general readers',
        lengthPreset,
        pointOfView,
        brandName: brandName.trim() || undefined,
        callToAction: callToAction.trim() || undefined,
        imageCount,
        aspectRatio,
        imageStyle,
        includeFaq,
        includeToc,
        textProvider: textProvider || undefined,
        textModel: textModel || undefined,
        useKnowledgeBase,
      });
      router.push(`/blog/${id}`);
    } catch (error) {
      toast.error('Generation could not start', {
        description: (error as Error).message,
      });
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong relative mx-auto w-full max-w-3xl rounded-4xl p-6 sm:p-8"
    >
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-glow shadow-lg shadow-brand-500/25">
          <PenLine className="h-5 w-5 text-white" strokeWidth={2.1} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">
            Compose your article
          </h2>
          <p className="text-[13px] text-ink-500">
            Describe the topic — MiniMax handles research, structure, copy, and imagery.
          </p>
        </div>
      </div>

      {/* Topic */}
      <Field label="Topic or working title" hint={`${topic.length}/300`}>
        <TextArea
          rows={3}
          maxLength={300}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. How small clinics can use AI receptionists to cut no-shows"
          className="text-[15px]"
        />
      </Field>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {TOPIC_IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => setTopic(idea)}
            className="group rounded-full border border-hairline bg-white/60 px-3 py-1.5 text-[11.5px] text-ink-500 transition-all duration-200 hover:border-brand-300 hover:bg-white hover:text-brand-600"
          >
            <Sparkles className="mr-1 inline h-3 w-3 text-brand-300 transition-colors group-hover:text-brand-500" />
            {idea.length > 46 ? `${idea.slice(0, 46)}…` : idea}
          </button>
        ))}
      </div>

      {/* Second-language title */}
      {altLanguage ? (
        <div className="mt-3">
          <Field label={`${altLanguage} title`} hint="exact H1 for that version">
            <TextInput
              value={altTopic}
              onChange={(e) => setAltTopic(e.target.value)}
              dir="auto"
              placeholder="Single, Double or King? Choosing Your Mattress Size"
            />
          </Field>
        </div>
      ) : null}

      {/* Keywords */}
      <div className="mt-5">
        <Field label="Target keywords" hint="Enter or comma to add">
          <KeywordInput keywords={keywords} onChange={setKeywords} />
        </Field>
      </div>

      {/* Secondary keywords */}
      <div className="mt-4">
        <Field label="Secondary keywords" hint="supporting, lower priority">
          <KeywordInput keywords={secondaryKeywords} onChange={setSecondaryKeywords} />
        </Field>
      </div>

      {/* Saved keyword sets */}
      <div className="mt-4">
        <Field label="Keyword sets" hint="reusable groups">
          <KeywordSetPicker
            selectedIds={keywordSetIds}
            onChange={setKeywordSetIds}
            language={language}
          />
        </Field>
      </div>

      {/* Length */}
      <div className="mt-5">
        <Field label="Article depth">
          <SegmentedControl
            value={lengthPreset}
            onChange={setLengthPreset}
            options={(options?.lengthPresets ?? []).map((preset) => ({
              value: preset.key,
              label: preset.label,
              sub: LENGTH_SUB[preset.key] ?? `~${preset.words} words`,
            }))}
          />
        </Field>
      </div>

      {/* Core controls */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Tone">
          <Select value={tone} onChange={(e) => setTone(e.target.value)}>
            {(options?.tones ?? []).map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Language">
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Also write in" hint="one click, both languages">
          <Select value={altLanguage} onChange={(e) => setAltLanguage(e.target.value)}>
            <option value="">Single language only</option>
            {LANGUAGES.filter((l) => l !== language).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Images" hint={`${imageCount}`}>
          <div className="flex h-[46px] items-center gap-3 rounded-xl border border-hairline bg-white/80 px-3.5">
            <ImageIcon className="h-4 w-4 shrink-0 text-brand-400" />
            <input
              type="range"
              min={0}
              max={6}
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-500"
            />
          </div>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Who is this for?" hint="optional">
          <TextInput
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. operations managers at mid-size clinics"
          />
        </Field>
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="mt-5 flex w-full items-center justify-between rounded-xl border border-dashed border-brand-200 bg-brand-50/40 px-4 py-2.5 text-[13px] font-medium text-brand-600 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50"
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Advanced controls
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${advanced ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {advanced ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Brand name" hint="optional">
                <TextInput
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Wasel"
                />
              </Field>

              <Field label="Point of view">
                <Select value={pointOfView} onChange={(e) => setPointOfView(e.target.value)}>
                  {(options?.pointsOfView ?? []).map((p) => (
                    <option key={p} value={p}>
                      {p.replace('-', ' ')}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Image style" className="sm:col-span-2">
                <Select value={imageStyle} onChange={(e) => setImageStyle(e.target.value)}>
                  {(options?.imageStyles ?? []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Image aspect ratio">
                <Select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                  {(options?.aspectRatios ?? []).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Writing engine">
                <Select
                  value={textProvider}
                  onChange={(e) => {
                    const next = e.target.value;
                    setTextProvider(next);
                    // Models are provider-specific, so move to that provider's default.
                    const picked = options?.textProviders.find((p) => p.id === next);
                    setTextModel(picked?.defaultModel ?? picked?.models[0] ?? '');
                  }}
                >
                  {(options?.textProviders ?? []).map((p) => (
                    <option key={p.id} value={p.id} disabled={!p.configured}>
                      {p.label}
                      {p.configured ? '' : ' — no API key'}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Model">
                <Select value={textModel} onChange={(e) => setTextModel(e.target.value)}>
                  {(activeProvider?.models ?? []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Product links"
                hint="one per line: Name | https://..."
                className="sm:col-span-2"
              >
                <TextArea
                  rows={3}
                  value={productsText}
                  onChange={(e) => setProductsText(e.target.value)}
                  dir="auto"
                  placeholder={'رويال بوكس بمرتبة واشنطن 15 قطعة | https://legendsleepsa.com/ar/category/dGRvPa'}
                  className="font-mono text-[12px]"
                />
              </Field>

              <Field label="Brand URL" hint="brand name links here">
                <TextInput
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  placeholder="https://legendsleepsa.com/"
                />
              </Field>

              <Field label="Closing call to action" hint="optional" className="sm:col-span-2">
                <TextInput
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="Book a 15-minute demo of the platform"
                />
              </Field>

              <Toggle
                checked={includeFaq}
                onChange={setIncludeFaq}
                label="FAQ section"
                description="Adds long-tail Q&A with FAQ schema"
              />
              <Toggle
                checked={includeToc}
                onChange={setIncludeToc}
                label="Table of contents"
                description="Anchor links above the first section"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Knowledge base */}
      {knowledge && knowledge.readyCount > 0 ? (
        <button
          type="button"
          onClick={() => setUseKnowledgeBase((v) => !v)}
          className={`mt-4 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
            useKnowledgeBase
              ? 'border-brand-300 bg-brand-50/70 ring-4 ring-brand-100'
              : 'border-hairline bg-white/70 hover:border-brand-200'
          }`}
        >
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
              useKnowledgeBase
                ? 'bg-gradient-to-br from-brand-500 to-sky-glow text-white shadow-md shadow-brand-500/25'
                : 'bg-brand-50 text-brand-400'
            }`}
          >
            <BrainCircuit className="h-4.5 w-4.5" strokeWidth={2.1} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold text-ink-900">
                Write in my blog&apos;s voice
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
                  useKnowledgeBase ? 'bg-brand-500' : 'bg-brand-100'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    useKnowledgeBase ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </span>
            </span>
            <span className="mt-1 block text-[12px] leading-relaxed text-ink-500">
              {knowledge.niche
                ? knowledge.niche
                : `Using ${knowledge.readyCount} crawled page${knowledge.readyCount === 1 ? '' : 's'} — run the analysis on the Knowledge page for sharper style matching.`}
            </span>
            <span className="mt-1.5 block text-[11px] text-ink-400">
              Matches your house style, avoids topics you have covered, and links to your
              real posts.
            </span>
          </span>
        </button>
      ) : null}

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-glow px-6 py-4 text-[15px] font-semibold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        {submitting ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            Starting the pipeline…
          </>
        ) : (
          <>
            <Wand2 className="h-4.5 w-4.5" strokeWidth={2.2} />
            Generate my article
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[11.5px] text-ink-400">
        Blueprint → long-form draft → original imagery → SEO audit. Usually 1–3 minutes.
      </p>
    </motion.section>
  );
}
