'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { getLevelBadge, getLevelName, getXPForNextLevel } from '@/lib/utils/format';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Header() {
  const { profile } = useAuth();
  if (!profile) return null;

  const maxXP = getXPForNextLevel(profile.level);
  const xpProgress = Math.min(100, ((profile.xp % maxXP) / maxXP) * 100);
  const badge = getLevelBadge(profile.level);
  const levelName = getLevelName(profile.level);

  return (
    <header className="sticky top-0 z-30 bg-[#070710]/80 backdrop-blur-xl border-b border-[#1e1e32]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-sm font-bold text-white">
            F
          </div>
          <span className="font-bold text-white text-sm">FinanceApp</span>
        </div>

        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-[#0f0f1a] border border-[#1e1e32] rounded-xl px-3 py-1.5">
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold text-amber-400 font-mono-numbers">0</span>
          </div>

          {/* XP + Level */}
          <Link href="/profile">
            <div className="flex items-center gap-3 bg-[#0f0f1a] border border-[#1e1e32] rounded-xl px-4 py-2 hover:border-[#2a2a45] transition-colors cursor-pointer">
              {/* Level info */}
              <div className="hidden sm:flex flex-col items-end gap-1 min-w-[120px]">
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="text-[11px] text-[#475569]">{badge} {levelName}</span>
                  <span className="text-[11px] font-bold text-blue-400">Nv. {profile.level}</span>
                </div>
                {/* XP Bar */}
                <div className="w-full h-1.5 bg-[#1e1e32] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] text-[#334155]">{profile.xp % maxXP}/{maxXP} XP</span>
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-400 flex-shrink-0">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
