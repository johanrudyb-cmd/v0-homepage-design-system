'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Link from 'next/link';

type Tab = 'classement' | 'rapport' | 'phases' | 'analyseur';

interface TrendsSubNavProps {
  active: Tab;
}

const tabs: { id: Tab; label: string; href: string; badge?: string }[] = [
  { id: 'classement', label: 'Tendances Hebdo', href: '/trends' },
  { id: 'analyseur', label: 'Analyseur Visuel', href: '/trends/visual' },
];

export function TrendsSubNav({ active }: TrendsSubNavProps) {
  return (
    <nav
      className="inline-flex p-1.5 rounded-[24px] bg-[#F5F5F7] border border-black/[0.03] w-fit"
      aria-label="Navigation Tendances"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
              isActive ? "text-white" : "text-[#6e6e73] hover:text-black"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-black rounded-full shadow-apple"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge && (
              <span className="relative z-10 ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF3B30] text-white">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
