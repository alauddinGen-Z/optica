
export interface OrderInfo {
  orderId: string;
  date: string;
  lensType: string;
  clientName: string;
  clientAddress: string;
}

export type GridData = Record<string, number>; // Key format: "sphere|cylinder"
