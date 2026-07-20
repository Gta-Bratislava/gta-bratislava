import type { FinancingCalculation, FinancingCalculationInput, FinancingSettings } from "./types";

const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateFinancing(input: FinancingCalculationInput): FinancingCalculation {
  const carPrice = finite(input.carPrice);
  const downPaymentEur = Math.min(carPrice, finite(input.downPaymentEur));
  const termMonths = Math.max(1, Math.round(finite(input.termMonths)));
  const annualInterestRate = finite(input.annualInterestRate);
  const fixedFee = finite(input.fixedFee);
  const percentFee = finite(input.percentFee);
  const financedAmount = Math.max(0, carPrice - downPaymentEur);
  const fees = fixedFee + financedAmount * percentFee / 100;
  const principalWithFees = financedAmount + fees;
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyPayment = principalWithFees <= 0 ? 0 : monthlyRate === 0
    ? principalWithFees / termMonths
    : principalWithFees * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalPayments = downPaymentEur + monthlyPayment * termMonths;
  return { carPrice: money(carPrice), downPaymentEur: money(downPaymentEur), downPaymentPercent: carPrice > 0 ? money(downPaymentEur / carPrice * 100) : 0, financedAmount: money(financedAmount), fees: money(fees), monthlyPayment: money(monthlyPayment), totalPayments: money(totalPayments), overpayment: money(Math.max(0, totalPayments - carPrice)), termMonths, annualInterestRate: money(annualInterestRate), fixedFee: money(fixedFee), percentFee: money(percentFee) };
}

export function validateFinancing(input: FinancingCalculationInput, settings: FinancingSettings) {
  const calculation = calculateFinancing(input);
  const errors: string[] = [];
  if (calculation.carPrice <= 0) errors.push("invalid_price");
  if (calculation.financedAmount < settings.min_amount) errors.push("below_minimum");
  if (calculation.financedAmount > settings.max_amount) errors.push("above_maximum");
  if (calculation.termMonths < settings.min_term || calculation.termMonths > settings.max_term || !settings.allowed_terms.includes(calculation.termMonths)) errors.push("invalid_term");
  if (calculation.downPaymentEur < settings.min_down_payment_eur || calculation.downPaymentPercent < settings.min_down_payment_percent) errors.push("down_payment_too_low");
  return { calculation, errors };
}
