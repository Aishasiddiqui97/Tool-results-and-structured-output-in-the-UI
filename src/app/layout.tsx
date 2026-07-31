import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeScope — AI Resume Analyzer',
  description:
    'FE-07: Tool Results & Structured Output in the UI. A resume analyzer powered by the Vercel AI SDK with typed tool parts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
