import { defineCollection, reference } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const markdown = (dir: string) => glob({ pattern: "*.md", base: `src/content/${dir}` });

export const collections = {
  people: defineCollection({
    loader: file("src/content/people.yaml"),
    schema: z.object({
      name: z.string(),
      url: z.url().optional(),
      me: z.boolean().default(false),
    }),
  }),
  publications: defineCollection({
    loader: markdown("publications"),
    schema: z.object({
      title: z.string(),
      authors: z.array(reference("people")),
      venue: z.string(),
      date: z.coerce.date(),
      doi: z.string().optional(),
      arxiv: z.string().optional(),
      code: z.union([z.url(), z.record(z.string(), z.url())]).optional(),
      bibtex: z.string().trim(),
    }),
  }),
  talks: defineCollection({
    loader: markdown("talks"),
    schema: z.object({
      title: z.string(),
      kind: z.enum(["Talk", "Poster"]),
      event: z.string(),
      place: z.string(),
      date: z.coerce.date(),
    }),
  }),
};
