import { redirect } from 'next/navigation';

export default async function SpyPage() {
  redirect('/brands/analyze?tab=tendances');
}
