'use client';

import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Tags,
  Trophy,
} from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/tools/analyzeResume';

type Tone = {
  label: string;
  verdict: string;
  text: string;
  stroke: string;
  bar: string;
  chip: string;
  dot: string;
};

function getTone(score: number): Tone {
  if (score >= 75)
    return {
      label: 'Strong profile',
      verdict: 'Hire-ready signal',
      text: 'text-emerald-400',
      stroke: 'stroke-emerald-400',
      bar: 'from-emerald-400 to-teal-400',
      chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
      dot: 'bg-emerald-400',
    };
  if (score >= 50)
    return {
      label: 'Solid foundation',
      verdict: 'Room to grow',
      text: 'text-amber-400',
      stroke: 'stroke-amber-400',
      bar: 'from-amber-400 to-orange-400',
      chip: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      dot: 'bg-amber-400',
    };
  return {
    label: 'Needs work',
    verdict: 'Start with the basics',
    text: 'text-rose-400',
    stroke: 'stroke-rose-400',
    bar: 'from-rose-400 to-red-400',
    chip: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    dot: 'bg-rose-400',
  };
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

const RING_R = 56;
const RING_C = 2 * Math.PI * RING_R;

export function ResumeScoreCard({ output }: { output: AnalyzeResumeOutput }) {
  const { score, strengths, improvements, keywords } = output;
  const tone = getTone(score);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (value) => setDisplay(Math.round(value)),
    });
    return () => controls.stop();
  }, [score]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={RING_R}
              fill="none"
              strokeWidth="11"
              className="stroke-white/10"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={RING_R}
              fill="none"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              className={tone.stroke}
              initial={{ strokeDashoffset: RING_C }}
              animate={{ strokeDashoffset: RING_C * (1 - score / 100) }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-3xl font-bold tabular-nums ${tone.text}`}>
              {display}
              <span className="text-base text-slate-500">%</span>
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
              score
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
            <p className={`text-base font-semibold ${tone.text}`}>{tone.label}</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">{tone.verdict}</p>
          <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10 sm:mx-0">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {keywords.length} relevant keyword{keywords.length === 1 ? '' : 's'} detected
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Strengths
            </p>
          </div>
          <motion.ul className="space-y-2">
            {strengths.map((strength) => (
              <motion.li key={strength} variants={itemVariants} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="text-xs leading-relaxed text-slate-300">{strength}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400/15 text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Improvements
            </p>
          </div>
          <motion.ul className="space-y-2">
            {improvements.map((improvement) => (
              <motion.li key={improvement} variants={itemVariants} className="flex items-start gap-2">
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-xs leading-relaxed text-slate-300">{improvement}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-400/15 text-indigo-400">
            <Tags className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Detected keywords
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.length > 0 ? (
            keywords.map((keyword) => (
              <motion.span
                key={keyword}
                variants={itemVariants}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${tone.chip}`}
              >
                {keyword}
              </motion.span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No strong keyword signals found.</span>
          )}
        </div>
      </motion.div>

      <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-[11px] text-slate-500">
        <Trophy className="h-3.5 w-3.5 text-slate-600" />
        Scored by the <span className="font-mono text-slate-400">analyzeResume</span> tool
      </div>
    </div>
  );
}
