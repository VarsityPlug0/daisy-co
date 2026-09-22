export interface BankDetails {
  id: string;
  bank: string;
  accountHolder: string;
  accountType: string;
  accountNumber: string;
  branchCode: string;
  payshap?: string;
}

export const BANKS: BankDetails[] = [
  {
    id: "payfast",
    bank: "PayFast Online Payment",
    accountHolder: "Bevanssons",
    accountType: "Instant Payment Gateway",
    accountNumber: "Card / Instant EFT",
    branchCode: "PayFast",
  },
];

export function getBankById(id: string): BankDetails {
  return BANKS.find(b => b.id === id) ?? BANKS[0];
}

export function getRotatingBank(orderCount: number): BankDetails {
  return BANKS[orderCount % BANKS.length];
}
