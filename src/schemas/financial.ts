import { z } from "zod";
import { DATA_AVAILABILITIES } from "../domain/financial-data";

export const isoDateSchema = z.string().datetime({ offset: true }).or(z.string().date());
export const nullableNumberSchema = z.number().finite().nullable();

export const financialMetadataSchema = z.object({
  source: z.string().trim().min(1),
  asOf: isoDateSchema.nullable(),
  generatedAt: z.string().datetime({ offset: true }),
  quality: z.enum(["verified", "high", "medium", "low", "unknown"]),
  availability: z.enum(DATA_AVAILABILITIES),
});

export function parseFinancialData<T>(schema: z.ZodType<T>, value: unknown, context: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `${issue.path.join(".") || "record"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid ${context}: ${details}`);
}
