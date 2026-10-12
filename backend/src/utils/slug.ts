import { prisma } from '../config/prisma';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type SlugModel = 'product' | 'category' | 'article' | 'brand' | 'landingPage';

/** Returns a unique slug for the model, appending -2, -3… when needed. */
export async function uniqueSlug(model: SlugModel, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `item-${Date.now().toString(36)}`;
  let candidate = root;
  for (let i = 2; i < 200; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma[model] as any).findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}
