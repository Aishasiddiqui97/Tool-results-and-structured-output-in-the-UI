'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanText } from 'lucide-react';

const STEPS = ['Reading resume input', 'Parsing sections', 'Scoring keywords'];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function ToolInputStreaming() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, 950);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex items-start gap-4"
    >
      <div className="relative mt-0.5">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-indigo-500/25" />
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-indigo-500/25 [animation-delay:0.5s]" />
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/15 text-indigo-300"
          >
            <ScanText className="h-5 w-5" />
          </motion.span>
        </div>
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <motion.p variants={item} className="text-sm font-semibold text-slate-100">
          Analyzing your resume…
        </motion.p>
        <motion.p variants={item} className="mt-0.5 text-xs text-slate-500">
          Building a structured score from {STEPS.length} quality signals.
        </motion.p>

        <motion.div variants={item} className="mt-3">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-indigo-400/0 via-indigo-400 to-indigo-400/0" />
          </div>
        </motion.div>

        <motion.ul variants={container} className="mt-3 space-y-1.5">
          {STEPS.map((label, index) => (
            <motion.li key={label} variants={item} className="flex items-center gap-2 text-xs">
              {index < step ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                  <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none">
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : index === step ? (
                <span className="flex h-4 w-4 items-center justify-center">
                  <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-indigo-400 border-t-transparent" />
                </span>
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/10 bg-white/5" />
              )}
              <span className={index === step ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}
