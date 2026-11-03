const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type LocalizedText = {
  es?: string;
  en?: string;
  ar?: string;
};

export type ContentStatus = "PUBLISHED" | "UNPUBLISHED";

export interface SectionItem {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  content?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
}

export interface SectionCategory {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
  items: SectionItem[];
}

export interface Section {
  id: string;
  title: LocalizedText | string;
  description?: LocalizedText | string | null;
  imageUrl?: string | null;
  status?: ContentStatus;
  sortOrder: number;
  categories: SectionCategory[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function fetchPublicData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 3600 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = (await response.json()) as ApiResponse<T>;

    if (!result.success || result.data == null) {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(`Failed to fetch public data from ${path}:`, error);
    throw error;
  }
}

export async function getPublishedSections(): Promise<Section[]> {
  const sections = await fetchPublicData<Section[]>("/api/sections");
  return sections ?? [];
}

export async function getPublishedSection(
  sectionId: string,
): Promise<Section | null> {
  return fetchPublicData<Section>(
    `/api/sections/${encodeURIComponent(sectionId)}`,
  );
}

export async function getPublishedCategory(
  sectionId: string,
  categoryId: string,
): Promise<{
  section: Section;
  category: SectionCategory;
} | null> {
  const section = await getPublishedSection(sectionId);

  if (!section) {
    return null;
  }

  const category =
    section.categories?.find((item) => item.id === categoryId) ?? null;

  if (!category) {
    return null;
  }

  return { section, category };
}

export async function getPublishedSectionItem(
  sectionId: string,
  categoryId: string,
  itemId: string,
): Promise<SectionItem | null> {
  return fetchPublicData<SectionItem>(
    `/api/sections/${encodeURIComponent(sectionId)}/categories/${encodeURIComponent(categoryId)}/items/${encodeURIComponent(itemId)}`,
  );
}

export function getLocalizedText(
  value: LocalizedText | string | null | undefined,
  locale: "es" | "en",
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value[locale] || value.es || value.en || "";
}
