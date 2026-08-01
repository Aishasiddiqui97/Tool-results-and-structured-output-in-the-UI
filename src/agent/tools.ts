import { tool } from 'ai';
import { z } from 'zod';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

function safeResolve(relPath: string): string {
  const resolved = path.resolve(PROJECT_ROOT, relPath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(`Refusing to read outside the project root: ${relPath}`);
  }
  return resolved;
}

function sanitizeName(name: string): string {
  return name.replace(/\.\./g, '').replace(/[\\/]+/g, '/').replace(/^\/+/, '');
}

const MAX_BYTES = 64 * 1024;

export const fsTools = {
  listFiles: tool({
    description:
      'List markdown, source, and documentation files inside a directory of the project. Returns relative paths. Use "." for the whole project, "agent-data" for agent inputs, "README.md" etc.',
    inputSchema: z.object({
      directory: z.string().default('.').describe('Directory relative to the project root'),
    }),
    execute: async ({ directory }) => {
      const dir = safeResolve(sanitizeName(directory));
      const entries = await readdir(dir, { withFileTypes: true });
      const files = entries
        .filter((e) => !e.isDirectory())
        .map((e) => path.join(directory, e.name).replace(/\\/g, '/'))
        .filter((p) => /\.(md|mts|ts|tsx|json|env)$/.test(p))
        .filter((p) => !p.includes('node_modules'));
      return { files };
    },
  }),

  readFile: tool({
    description:
      'Read the full text content of a file inside the project. Use for markdown notes, README files, and source files. Returns the raw content with a character count.',
    inputSchema: z.object({
      path: z.string().describe('Path relative to the project root, e.g. "agent-data/weekly-update.md"'),
    }),
    execute: async ({ path: filePath }) => {
      const file = safeResolve(sanitizeName(filePath));
      const buf = await readFile(file);
      if (buf.byteLength > MAX_BYTES) {
        throw new Error(`File too large to read (${buf.byteLength} bytes, max ${MAX_BYTES})`);
      }
      return { content: buf.toString('utf-8'), characters: buf.byteLength };
    },
  }),

  readAgentData: tool({
    description:
      'Read one of the structured agent input files: "weekly-update.md" (my week summary), "learning.md" (topics I studied), or "projects.md" (my project notes). This is my primary data source.',
    inputSchema: z.object({
      file: z.enum(['weekly-update.md', 'learning.md', 'projects.md']),
    }),
    execute: async ({ file }) => {
      const buf = await readFile(safeResolve(`agent-data/${file}`));
      return {
        source: `agent-data/${file}`,
        content: buf.toString('utf-8'),
      };
    },
  }),
} as const;
