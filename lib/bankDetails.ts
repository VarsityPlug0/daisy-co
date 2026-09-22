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
  {
    id: "fnb",
    bank: "First National Bank (FNB)",
    accountHolder: "Bevans Sons (Pty) Ltd",
    accountType: "Gold Business Account",
    accountNumber: "63225313418",
    branchCode: "250655",
  },
];

export function getBankById(id: string): BankDetails {
  return BANKS.find(b => b.id === id) ?? BANKS[0];
}

export function getRotatingBank(orderCount: number): BankDetails {
  return BANKS[orderCount % BANKS.length];
}
