import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 内容层：所有静态内容（Markdown）放在 src/content/docs 下。
// 目录即导航——每个一级子目录对应一个核心模块，文件即一篇资料。
// 维护者用 GitHub PR / Issue 协作，Git 自带版本化与审核流。
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    applies_to: z.string().optional(), // 适用对象，如「全体在校生」
    source: z.string().optional(), // 来源：官网链接 / 「学长访谈」
    updated: z.string().optional(), // 更新时间，如 2026-09
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false), // true 则不发布
  }),
});

export const collections = { docs };
