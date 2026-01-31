import { redirect } from 'next/navigation';

/** Ancienne route Radar Mondial : rediriger vers Tendances */
export default function HybridRadarPage() {
  redirect('/trends');
}
