import { describe, expect, it } from "vitest";
import { normalizeInstrument, searchInstruments, validateInstruments } from "../../scripts/equity/instruments-lib.mjs";
import { providerErrorCode, transformUpstoxCandles } from "../../src/providers/market/upstox-transform";

const reliance = { segment:"NSE_EQ",exchange:"NSE",instrument_type:"EQ",instrument_key:"NSE_EQ|INE002A01018",trading_symbol:"RELIANCE",name:"Reliance Industries Limited",isin:"INE002A01018",lot_size:1,tick_size:.05,exchange_token:"2885" };
describe("Indian equity platform",()=>{
  it("validates a cash-equity security",()=>expect(normalizeInstrument(reliance).ok).toBe(true));
  it("rejects derivatives and malformed ISINs",()=>{expect(normalizeInstrument({...reliance,segment:"NSE_FO",instrument_type:"FUT"}).ok).toBe(false);expect(normalizeInstrument({...reliance,isin:"BAD"}).ok).toBe(false)});
  it("detects duplicate instrument keys and exchange symbols",()=>expect(validateInstruments([reliance,reliance]).duplicates).toHaveLength(1));
  it("ranks exact symbols and searches company names and ISIN",()=>{const rows=[normalizeInstrument(reliance).value];expect(searchInstruments(rows,"RELIANCE")[0].symbol).toBe("RELIANCE");expect(searchInstruments(rows,"Reliance Industries")).toHaveLength(1);expect(searchInstruments(rows,"INE002A01018")).toHaveLength(1)});
  it("transforms valid candles without turning missing values into zero",()=>{expect(transformUpstoxCandles([["2026-01-01T00:00:00+05:30",1,2,.5,1.5,100,0]])[0].close).toBe(1.5);expect(transformUpstoxCandles([["bad",1,2,null,1.5,100]])).toEqual([])});
  it("maps provider authentication, rate limit and timeout failures",()=>{expect(providerErrorCode(401).code).toBe("AUTH_REQUIRED");expect(providerErrorCode(429)).toEqual({code:"RATE_LIMITED",retryable:true});expect(providerErrorCode(undefined,true).code).toBe("TIMEOUT")});
});
