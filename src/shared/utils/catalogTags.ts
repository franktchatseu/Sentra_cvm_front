export const CATALOG_TAG_PREFIX = "catalog:";

export const buildCatalogTag = (categoryId: number | string) =>
  `${CATALOG_TAG_PREFIX}${categoryId}`;

export const parseCatalogTag = (tag: string): number | null => {
  if (typeof tag !== "string" || !tag.startsWith(CATALOG_TAG_PREFIX)) {
    return null;
  }

  const value = tag.slice(CATALOG_TAG_PREFIX.length);
  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
};
