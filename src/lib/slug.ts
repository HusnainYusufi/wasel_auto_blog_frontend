import type { ReactNode } from 'react';

export function slugify(input: string): string {
  return (
    (input || 'section')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
      .replace(/^-|-$/g, '') || 'section'
  );
}

export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in (node as never)) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

/** Parses "Name | https://url" lines into product link objects. */
export function parseProductLines(
  text: string,
): Array<{ name: string; url: string }> {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Split on the last pipe so names containing one still work.
      const cut = line.lastIndexOf('|');
      if (cut === -1) return null;
      const name = line.slice(0, cut).trim();
      const url = line.slice(cut + 1).trim();
      return name && /^https?:\/\//i.test(url) ? { name, url } : null;
    })
    .filter((p): p is { name: string; url: string } => p !== null)
    .slice(0, 12);
}
