export interface StockMovementInput {
  productId: string;
  quantity: number;
  remarks?: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  userId: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  previousStock: number;
  newStock: number;
  remarks: string | null;
  createdAt: string;
}

export interface TransactionListItem {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
  product: {
    id?: string;
    name: string;
    sku?: string;
    barcode?: string | null;
  } | null;
  user?: {
    name: string;
  } | null;
}
