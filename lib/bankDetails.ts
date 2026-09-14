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
    id: "tymebank",
    bank: "TymeBank / GoTymeBank",
    accountHolder: "Bevanssons",
    accountType: "Business Account",
    accountNumber: "51072673949",
    branchCode: "678910",
  },
];

export function getBankById(id: string): BankDetails {
  return BANKS.find(b => b.id === id) ?? BANKS[0];
}

export function getRotatingBank(orderCount: number): BankDetails {
  return BANKS[orderCount % BANKS.length];
}
