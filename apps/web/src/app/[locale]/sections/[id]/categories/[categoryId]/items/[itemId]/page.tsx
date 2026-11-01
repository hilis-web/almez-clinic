import { notFound } from "next/navigation";
import ItemPage from "../../../../../../../sections/[id]/categories/[categoryId]/items/[itemId]/page";

interface ItemRouteProps {
  params: Promise<{
    locale: string;
    id: string;
    categoryId: string;
    itemId: string;
  }>;
}

export default async function LocalizedItemPage({ params }: ItemRouteProps) {
  const { locale } = await params;

  if (locale !== "es" && locale !== "en") {
    notFound();
  }

  return <ItemPage />;
}
