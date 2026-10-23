import { expect, it } from 'vitest'
import { findMoneyAfterLabel, parseIndianMoney } from '../../scripts/cards/money-parser.mjs'

it('does not interpret Know More as a thousand multiplier on annual fees', () => {
  expect(findMoneyAfterLabel('Annual Fee: ₹500 Know More Apply Now', ['annual fee'])).toBe(500)
  expect(findMoneyAfterLabel('Annual Fee: ₹499 Know More', ['annual fee'])).toBe(499)
  expect(findMoneyAfterLabel('Annual Fee: ₹1,000 Key Benefits', ['annual fee'])).toBe(1000)
  expect(parseIndianMoney('2.5 lakh')).toBe(250000)
  expect(parseIndianMoney('2k')).toBe(2000)
  expect(parseIndianMoney('nil')).toBe(0)
})
