import {
  workloadRepresentationSchema,
  type WorkloadRepresentation,
} from './workload';

export function parseWorkload(input: unknown): WorkloadRepresentation {
  return workloadRepresentationSchema.parse(input);
}

export function validateWorkload(input: unknown) {
  return workloadRepresentationSchema.safeParse(input);
}
