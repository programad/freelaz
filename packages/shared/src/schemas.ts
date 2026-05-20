import { z } from "zod";

export const submissionSchema = z.object({
  profession: z.string().min(1).max(50),
  experienceLevel: z.enum(["junior", "pleno", "senior", "specialist"]),
  state: z.string().min(1).max(10),
  hourlyRateBRL: z.number().nonnegative().max(10_000),
  hourlyRateUSD: z.number().nonnegative().max(10_000),
  clientCountry: z.string().max(80).optional(),
  industry: z.string().max(80).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  taxRegime: z.string().max(20).optional(),
  notes: z.string().max(280).optional(),
});

export type SubmissionPayload = z.infer<typeof submissionSchema>;
