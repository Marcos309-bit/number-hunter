import React from 'react';

export function NeonBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-vice-black"
    >
      {/* Deep Vice City night atmospheric gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 15%, rgba(255, 60, 172, 0.22) 0%, transparent 45%), radial-gradient(circle at 82% 20%, rgba(0, 229, 255, 0.18) 0%, transparent 42%), radial-gradient(circle at 50% 85%, rgba(138, 43, 226, 0.24) 0%, transparent 55%), linear-gradient(180deg, #080812 0%, #0D0B1E 50%, #080812 100%)',
        }}
      />

      {/* Animated ambient neon orbs */}
      <div className="animate-float-slow absolute -left-24 top-16 h-80 w-80 rounded-full bg-vice-pink/20 blur-[110px]" />
      <div
        className="animate-float-slow absolute -right-24 top-28 h-96 w-96 rounded-full bg-vice-cyan/15 blur-[120px]"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="animate-float-slow absolute bottom-[-80px] left-1/3 h-80 w-80 rounded-full bg-vice-purple/25 blur-[120px]"
        style={{ animationDelay: '-5s' }}
      />
      <div className="animate-pulse-neon absolute bottom-12 right-1/4 h-56 w-56 rounded-full bg-vice-orange/10 blur-[100px]" />

      {/* Perspective horizon grid */}
      <div className="vice-grid absolute inset-0 opacity-50" />

      {/* Subtle horizon neon laser line */}
      <div className="absolute inset-x-0 top-[44%] h-px bg-gradient-to-r from-transparent via-vice-pink/25 to-transparent" />

      {/* Geometric corner HUD accents */}
      <div className="absolute left-6 top-6 hidden h-12 w-12 border-l-2 border-t-2 border-vice-cyan/30 sm:block" />
      <div className="absolute right-6 top-6 hidden h-12 w-12 border-r-2 border-t-2 border-vice-pink/30 sm:block" />
      <div className="absolute bottom-6 left-6 hidden h-12 w-12 border-b-2 border-l-2 border-vice-purple/30 sm:block" />
      <div className="absolute bottom-6 right-6 hidden h-12 w-12 border-b-2 border-r-2 border-vice-orange/30 sm:block" />

      {/* Subtle scanline overlay */}
      <div className="vice-scanlines absolute inset-0" />
    </div>
  );
}
