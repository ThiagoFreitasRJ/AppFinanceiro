'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { getLevelBadge, getLevelName, getXPForNextLevel } from '@/lib/utils/format';
import { XPBar } from '@/components/ui/ProgressBar';
import Link from 'next/link';

export function Header() {
  const { profile } = useAuth();

  if (!profile) return null;

  const maxXP = getXPForNextLevel(profile.level);
  const levelName = getLevelName(profile.level);
  const badge = getLevelBadge(profile.level);

  return (
    <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="md:hidden w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center text-sm font-bold text-white">F</div>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5 bg-[#1F1F1F] rounded-lg px-3 py-1.5">
          <span className="text-sm">🔥</span>
          <span className="text-sm font-bold text-[#FFAA00]">0</span>
        </div>

        {/* XP + Level */}
        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="hidden sm:block min-w-[160px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#666666]">{badge} {levelName}</span>
              <span className="text-xs text-[#0066FF] font-bold">Nv. {profile.level}</span>
            </div>
            <XPBar xp={profile.xp % maxXP} maxXp={maxXP} level={profile.level} />
          </div>
          <div className="w-8 h-8 bg-[#1F1F1F] border border-[#2A2A2A] rounded-full flex items-center justify-center text-sm font-bold text-[#0066FF]">
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  );
}
