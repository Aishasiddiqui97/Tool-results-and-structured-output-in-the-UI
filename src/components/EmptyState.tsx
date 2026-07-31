'use client';

import type { LucideIcon } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

/**
 * Shared visual shell for every empty / informational state (first run,
 * no results, etc.). Keeps the layout stable across states so nothing jumps.
 */
export function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
  className = '',
}: {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`flex flex-1 flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      <motion.span
        variants={item}
        className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl ${
          iconClassName ?? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/30'
        }`}
      >
        <Icon className="h-8 w-8" />
      </motion.span>

      <motion.h2
        variants={item}
        className="mt-6 max-w-md text-xl font-semibold text-slate-100"
      >
        {title}
      </motion.h2>

      {description ? (
        <motion.p
          variants={item}
          className="mt-2 max-w-md text-sm leading-relaxed text-slate-400"
        >
          {description}
        </motion.p>
      ) : null}

      {children ? (
        <motion.div variants={item} className="mt-8 w-full max-w-lg">
          {children}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
