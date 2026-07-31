'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Hash, Type } from 'lucide-react';

const SECTIONS = ['experience', 'education', 'skills', 'projects'];

export function ToolInputAvailable({ resumeText }: { resumeText: string }) {
  const words = useMemo(() => resumeText.trim().split(/\s+/).filter(Boolean).length, [resumeText]);
  const chars = resumeText.length;

  const detectedSections = useMemo(() => {
    const text = resumeText.toLowerCase();
    return SECTIONS.filter((section) => text.includes(section));
  }, [resumeText]);

  const preview = resumeText.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-400">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">Resume document</p>
          <p className="text-xs text-slate-500">Input captured from your message</p>
        </div>
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <CheckCircle2 className="h-3 w-3" />
          Received
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          <Type className="h-3 w-3 text-slate-500" />
          {words.toLocaleString()} words
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
          <Hash className="h-3 w-3 text-slate-500" />
          {chars.toLocaleString()} chars
        </span>
        {detectedSections.map((section) => (
          <span
            key={section}
            className="rounded-md border border-indigo-400/25 bg-indigo-400/10 px-2.5 py-1 text-[11px] capitalize text-indigo-300"
          >
            {section}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{preview}</p>
      </div>
    </motion.div>
  );
}
