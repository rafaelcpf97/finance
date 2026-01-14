export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  amount: string;
  wallet_from_id: string | null;
  wallet_to_id: string;
  status: 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}
