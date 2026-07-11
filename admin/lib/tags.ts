import { prisma } from "@/lib/prisma";

/**
 * Given an array of tag names, returns an array of { id: string } objects
 * suitable for Prisma's connect/set relation operations.
 * Creates new tags if they don't exist.
 *
 * Note: For SQLite compatibility, we avoid Prisma's `mode: "insensitive"`
 * filter (which is only supported on PostgreSQL/MongoDB).
 */
export async function resolveTagIds(tagNames: string[]): Promise<{ id: string }[]> {
  if (!tagNames || tagNames.length === 0) return [];

  const ids: { id: string }[] = [];

  for (const name of tagNames) {
    const cleanName = name.trim().toLowerCase();
    if (!cleanName) continue;

    // Generate a slug from the name (will be lowercase)
    const slug = cleanName
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Try to find existing tag by slug (already lowercase, no insensitive needed)
    let tag = await prisma.tag.findUnique({ where: { slug } });

    // If not found by slug, try finding by name (case-insensitive via toLowerCase)
    if (!tag) {
      tag = await prisma.tag.findFirst({
        where: { name: { equals: cleanName } },
      });
    }

    // If still not found, create it
    if (!tag) {
      tag = await prisma.tag.create({
        data: { name: cleanName, slug },
      });
    }

    ids.push({ id: tag.id });
  }

  return ids;
}
