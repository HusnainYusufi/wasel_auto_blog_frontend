export type BlogStatus = 'queued' | 'running' | 'completed' | 'failed';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AuditEntry {
  id: string;
  action: string;
  note: string;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export interface BlogSummary {
  id: string;
  status: BlogStatus;
  progress: number;
  currentStep: string | null;
  topic: string;
  title: string | null;
  slug: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string | null;
  keywords: string[];
  wordCount: number;
  readingMinutes: number;
  heroImageUrl: string | null;
  language: string;
  tone: string;
  textProvider: string;
  textModel: string;
  createdAt: string;
  completedAt: string | null;
  reviewStatus: ReviewStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
}

export interface BlogImage {
  id: string;
  role: 'hero' | 'section';
  sectionIndex: number | null;
  prompt: string;
  alt: string;
  caption: string;
  url: string;
  aspectRatio: string;
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number;
}

export interface SeoData {
  seoScore?: number;
  tags?: string[];
  categories?: string[];
  socialTitle?: string;
  socialDescription?: string;
  twitterPost?: string;
  linkedinPost?: string;
  internalLinkIdeas?: string[];
  improvementTips?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  keywordDensity?: KeywordDensity[];
  faq?: Array<{ question: string; answer: string }>;
  jsonLd?: Record<string, unknown>;
}

export interface OutlineSection {
  heading: string;
  summary: string;
  talkingPoints: string[];
  keywords: string[];
}

export interface BlogDetail extends BlogSummary {
  contentMarkdown: string | null;
  altLanguage: string | null;
  altTitle: string | null;
  altContentMarkdown: string | null;
  contentHtml: string | null;
  outline: { sections?: OutlineSection[]; [key: string]: unknown } | null;
  seo: SeoData | null;
  error: string | null;
  config: Record<string, unknown>;
  images: BlogImage[];
  events: ProgressEvent[];
}

export interface ProgressEvent {
  blogId?: string;
  step: string;
  status: 'running' | 'done' | 'failed';
  message: string;
  progress: number;
  createdAt: string;
}

export interface PipelineStep {
  key: string;
  label: string;
  from: number;
  to: number;
}

export interface TextProviderOption {
  id: 'minimax' | 'gemini';
  label: string;
  configured: boolean;
  models: string[];
  defaultModel: string | null;
}

export interface GeneratorOptions {
  tones: string[];
  pointsOfView: string[];
  imageStyles: string[];
  aspectRatios: string[];
  textProviders: TextProviderOption[];
  lengthPresets: Array<{ key: string; label: string; words: number; sections: number }>;
  steps: PipelineStep[];
  defaults: {
    textProvider: 'minimax' | 'gemini' | null;
    textModel: string | null;
    imageModel: string;
  };
}

export interface GenerateRequest {
  topic: string;
  keywords: string[];
  language: string;
  tone: string;
  audience: string;
  lengthPreset: string;
  pointOfView: string;
  brandName?: string;
  callToAction?: string;
  imageCount: number;
  aspectRatio: string;
  imageStyle: string;
  includeFaq: boolean;
  includeToc: boolean;
  keywordSetIds?: string[];
  secondaryKeywords?: string[];
  /** Also produce the article in this language, in the same run. */
  altLanguage?: string;
  productSourceIds?: string[];
  textProvider?: string;
  textModel?: string;
  useKnowledgeBase?: boolean;
  knowledgeSourceIds?: string[];
}

export interface KnowledgeSource {
  id: string;
  url: string;
  status: 'pending' | 'ready' | 'failed';
  title: string | null;
  siteName: string | null;
  description: string | null;
  headings: string[];
  wordCount: number;
  error: string | null;
  discoveredFrom: string | null;
  fetchedAt: string | null;
  createdAt: string;
}

export interface KnowledgeList {
  total: number;
  ready: number;
  pending: number;
  failed: number;
  items: KnowledgeSource[];
}

export interface SuggestedTopic {
  title: string;
  angle: string;
  keywords: string[];
}

export interface KnowledgeProfile {
  exists: boolean;
  readyCount: number;
  stale: boolean;
  niche?: string;
  audience?: string;
  toneSummary?: string;
  styleNotes?: string[];
  recurringThemes?: string[];
  coveredTopics?: string[];
  contentGaps?: string[];
  suggestedTopics?: SuggestedTopic[];
  sourceCount?: number;
  generatedAt?: string | null;
}

export interface KeywordSet {
  id: string;
  name: string;
  note: string | null;
  keywords: string[];
  language: string;
  pinned: boolean;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordSetInput {
  name: string;
  note?: string;
  keywords: string[];
  language?: string;
  pinned?: boolean;
}
