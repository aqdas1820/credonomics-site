import { z } from "zod";
import { financialMetadataSchema, isoDateSchema } from "./financial";

export const ipoRecordSchema = financialMetadataSchema.extend({
  slug: z.string().trim().min(1),
  companyName: z.string().trim().min(1),
  status: z.string().trim().min(1),
  board: z.enum(["Mainboard", "SME"]).nullable().optional(),
  exchange: z.string().trim().min(1).nullable().optional(),
  priceMin: z.number().finite().nonnegative().nullable().optional(),
  priceMax: z.number().finite().nonnegative().nullable().optional(),
  openDate: isoDateSchema.nullable().optional(),
  closeDate: isoDateSchema.nullable().optional(),
  listingDate: isoDateSchema.nullable().optional(),
  prospectusUrl: z.string().url().nullable().optional(),
});
