import type { MetadataRoute } from "next";

const BASE_URL = "https://almez-clinic.vercel.app";
const LANGUAGES = ["es", "en"] as const;

interface PublishedItem {
  id: string;
  status: string;
}

interface PublishedCategory {
  id: string;
  status: string;
  items?: PublishedItem[];
}

interface PublishedSection {
  id: string;
  status: string;
  categories?: PublishedCategory[];
}

function localizedAlternates(path: string) {
  return {
    languages: {
      es: `${BASE_URL}/es${path}`,
      en: `${BASE_URL}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  const staticPages = [
    {
      path: "",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      path: "/consultation",
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  for (const page of staticPages) {
    for (const language of LANGUAGES) {
      urls.push({
        url: `${BASE_URL}/${language}${page.path}`,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: localizedAlternates(page.path),
      });
    }
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await fetch(`${apiUrl}/api/sections`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch published sections");
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid sections API response");
    }

    const sections: PublishedSection[] = result.data;

    for (const section of sections) {
      if (section.status !== "PUBLISHED") continue;

      const sectionPath = `/sections/${section.id}`;

      for (const language of LANGUAGES) {
        urls.push({
          url: `${BASE_URL}/${language}${sectionPath}`,
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: localizedAlternates(sectionPath),
        });
      }

      for (const category of section.categories ?? []) {
        if (category.status !== "PUBLISHED") continue;

        const categoryPath = `${sectionPath}/categories/${category.id}`;

        for (const language of LANGUAGES) {
          urls.push({
            url: `${BASE_URL}/${language}${categoryPath}`,
            changeFrequency: "weekly",
            priority: 0.7,
            alternates: localizedAlternates(categoryPath),
          });
        }

        for (const item of category.items ?? []) {
          if (item.status !== "PUBLISHED") continue;

          const itemPath = `${categoryPath}/items/${item.id}`;

          for (const language of LANGUAGES) {
            urls.push({
              url: `${BASE_URL}/${language}${itemPath}`,
              changeFrequency: "monthly",
              priority: 0.6,
              alternates: localizedAlternates(itemPath),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Sitemap generation failed:", error);
  }

  return urls;
}
