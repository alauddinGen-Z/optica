
export interface OrderInfo {
  orderId: string;
  date: string;
  lensType: string;
  clientName: string;
  clientAddress: string;
}

export type GridData = Record<string, number>; // Key format: "sphere|cylinder"

export interface InvoiceHistory {
  id: string; // e.g. timestamp or uuid
  name: string; // user-provided name for the invoice session
  orderInfo: OrderInfo;
  gridData: GridData;
  signs: { sph: '-' | '+'; cyl: '-' | '+' };
  updatedAt: string; // ISO string
}
