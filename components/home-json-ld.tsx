import { withLocale, type AppLocale } from "@/lib/i18n";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

type ToolListItem = { name: string; url: string };

export function HomeJsonLd({
  locale,
  description,
  tools,
}: {
  locale: AppLocale;
  description: string;
  tools: ToolListItem[];
}) {
  const homePath = withLocale(locale, "/");
  const homeUrl = absoluteUrl(homePath);
  const inLanguage = locale === "zh-CN" ? "zh-CN" : "en";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        url: homeUrl,
        name: SITE_NAME,
        description,
        inLanguage,
      },
      {
        "@type": "ItemList",
        "@id": `${homeUrl}#tool-list`,
        name: SITE_NAME,
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          item: t.url,
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
