import { z } from 'zod';

export const artifactReferenceSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  hash: z.string().regex(/^sha256:[0-9a-fA-F]{64}$/),
  signature: z.string().min(1).optional(),
  path: z.string().min(1),
}).strict();

export type ArtifactReference = z.infer<typeof artifactReferenceSchema>;
