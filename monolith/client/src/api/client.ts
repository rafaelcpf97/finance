import { User, TransactionHistoryResponse, Notification } from '../types';

const API_BASE_URL = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Users
  createUser: (data: { name: string; email: string }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: (userId: string) => request<User>(`/users/${userId}`),

  // Wallets
  getBalance: (userId: string) =>
    request<{ balance: number }>(`/wallets/${userId}/balance`),

  deposit: (userId: string, amount: number) =>
    request<{ balance: number }>(`/wallets/${userId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Transactions
  transfer: (fromUserId: string, toUserId: string, amount: number) =>
    request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUserId, amount }),
    }),

  getTransactionHistory: (userId: string, page: number = 1, pageSize: number = 20) =>
    request<TransactionHistoryResponse>(`/transactions/${userId}?page=${page}&pageSize=${pageSize}`),

  // Notifications
  getNotifications: (userId: string, isRead?: boolean) => {
    const query = isRead !== undefined ? `?read=${isRead}` : '';
    return request<Notification[]>(`/notifications/${userId}${query}`);
  },

  markNotificationAsRead: (notificationId: string) =>
    request<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    }),
};
