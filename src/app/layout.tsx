import type { Metadata } from 'next';
import { Orbitron, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['500', '600', '700', '800', '900'],
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['500', '700'],
});

export const metadata: Metadata = {
  title: 'NUMBER HUNTER — Futuristic Vice City',
  description:
    'Can you find the secret number? Jogo futurista de adivinhação numérica inspirado na atmosfera neon de Vice City.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable} bg-vice-black font-sans text-slate-100 antialiased selection:bg-vice-pink/35 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
