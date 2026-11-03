import { redirect } from "next/navigation";

interface SectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;

  redirect(`/es/sections/${id}`);
}
