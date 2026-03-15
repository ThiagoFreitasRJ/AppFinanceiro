'use client';

import { motion } from 'framer-motion';

const orbs = [
  { x: '10%', y: '20%', size: 400, color: 'rgba(59,130,246,0.06)', delay: 0, duration: 9 },
  { x: '70%', y: '10%', size: 350, color: 'rgba(139,92,246,0.05)', delay: 2, duration: 11 },
  { x: '80%', y: '60%', size: 500, color: 'rgba(59,130,246,0.04)', delay: 4, duration: 13 },
  { x: '20%', y: '70%', size: 300, color: 'rgba(16,185,129,0.04)', delay: 1, duration: 10 },
  { x: '50%', y: '40%', size: 250, color: 'rgba(139,92,246,0.03)', delay: 3, duration: 12 },
];

const gridLines = Array.from({ length: 8 });

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.05, 0.97, 1.03, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#070710] to-transparent" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070710] to-transparent" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
}
