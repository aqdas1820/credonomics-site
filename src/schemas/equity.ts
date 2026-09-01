import { z } from "zod";
import { financialMetadataSchema, isoDateSchema, nullableNumberSchema } from "./financial";

export const indianEquityIdentitySchema = z.object({
  instrumentKey: z.string().trim().min(3),
  symbol: z.string().trim().min(1).max(32),
  exchange: z.enum(["NSE", "BSE"]),
  companyName: z.string().trim().min(1),
  bseCode: z.string().trim().min(1).nullable().optional(),
  isin: z.string().regex(/^IN[A-Z0-9]{10}$/).nullable().optional(),
  sector: z.string().trim().min(1).nullable().optional(),
  industry: z.string().trim().min(1).nullable().optional(),
  tradingSymbol: z.string().trim().min(1).optional(), instrumentType: z.string().trim().min(1).optional(), lotSize: nullableNumberSchema.optional(), tickSize: nullableNumberSchema.optional(),
});

const marketFields = {
  price: nullableNumberSchema,
  change: nullableNumberSchema,
  changePercent: nullableNumberSchema,
  timestamp: z.string().datetime({ offset: true }).nullable(),
  previousClose: nullableNumberSchema,
  open: nullableNumberSchema,
  high: nullableNumberSchema,
  low: nullableNumberSchema,
  volume: nullableNumberSchema,
  fiftyTwoWeekHigh: nullableNumberSchema,
  fiftyTwoWeekLow: nullableNumberSchema,
};

export const marketQuoteSchema = indianEquityIdentitySchema
  .merge(financialMetadataSchema)
  .extend(marketFields)
  .superRefine((quote, context) => {
    if (quote.availability !== "unavailable" && quote.price === null) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["price"], message: "price is required when a quote is available" });
    }
  });

export const companyFundamentalsSchema = indianEquityIdentitySchema
  .merge(financialMetadataSchema)
  .extend({
    marketCap: nullableNumberSchema,
    pe: nullableNumberSchema,
    pb: nullableNumberSchema,
    eps: nullableNumberSchema,
    bookValue: nullableNumberSchema,
    dividendYield: nullableNumberSchema,
    roe: nullableNumberSchema,
    roce: nullableNumberSchema,
    debtToEquity: nullableNumberSchema,
  });

export const financialStatementsSchema = indianEquityIdentitySchema
  .merge(financialMetadataSchema)
  .extend({
    revenue: nullableNumberSchema,
    profit: nullableNumberSchema,
    operatingProfit: nullableNumberSchema,
    netWorth: nullableNumberSchema,
    borrowings: nullableNumberSchema,
    cashFlow: nullableNumberSchema,
  });

export const shareholdingSchema = indianEquityIdentitySchema
  .merge(financialMetadataSchema)
  .extend({
    promoterHolding: nullableNumberSchema,
    fiiHolding: nullableNumberSchema,
    diiHolding: nullableNumberSchema,
    publicHolding: nullableNumberSchema,
  });

export const historicalPriceSchema = z.object({
  date: isoDateSchema,
  open: nullableNumberSchema,
  high: nullableNumberSchema,
  low: nullableNumberSchema,
  close: nullableNumberSchema,
  volume: nullableNumberSchema,
});
