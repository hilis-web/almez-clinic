import { notFound } from "next/navigation";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  return (
    <>
      <LocaleHtmlLanguage locale={locale} />
      {children}
    </>
  );
}

function LocaleHtmlLanguage({ locale }: { locale: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang = ${JSON.stringify(locale)}; document.documentElement.dir = "ltr";`,
      }}
    />
  );
}
