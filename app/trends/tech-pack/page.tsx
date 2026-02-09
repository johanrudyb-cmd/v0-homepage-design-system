import { redirect } from 'next/navigation';

/** Redirige vers la création de tech pack dans Design Studio (avec id en query si présent). */
export default async function TrendsTechPackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const query = id ? `?id=${encodeURIComponent(id)}` : '';
  redirect(`/design-studio/tech-pack${query}`);
}
