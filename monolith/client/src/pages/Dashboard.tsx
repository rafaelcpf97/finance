import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { User, Transaction, Notification } from '../types';
import './Dashboard.css';

function Dashboard() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Transfer form state
  const [transferToEmail, setTransferToEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId]);

  const loadDashboardData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [userData, balanceData, transactionsData, notificationsData] = await Promise.all([
        api.getUser(userId),
        api.getBalance(userId),
        api.getTransactionHistory(userId),
        api.getNotifications(userId),
      ]);

      setUser(userData);
      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions);
      setNotifications(notificationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !depositAmount) return;

    setDepositLoading(true);
    try {
      const result = await api.deposit(userId, parseFloat(depositAmount));
      setBalance(result.balance);
      setDepositAmount('');
      await loadDashboardData(); // Reload transactions
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deposit');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !transferToEmail || !transferAmount) return;

    setTransferLoading(true);
    try {
      // First, get the recipient user by email (we'll need to find their ID)
      // For simplicity, we'll assume the user provides a user ID or we search by email
      // Since we don't have a search endpoint, let's assume they provide user ID for now
      // In a real app, you'd have a user lookup endpoint
      const toUserId = transferToEmail; // For now, treat as user ID
      
      await api.transfer(userId, toUserId, parseFloat(transferAmount));
      setTransferToEmail('');
      setTransferAmount('');
      await loadDashboardData(); // Reload balance, transactions, and notifications
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>
        <p className="user-email">{user?.email}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card balance-card">
          <h3>Current Balance</h3>
          <div className="balance-amount">${balance?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="dashboard-card">
          <h3>Deposit Funds</h3>
          <form onSubmit={handleDeposit}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
              disabled={depositLoading}
            />
            <button type="submit" disabled={depositLoading}>
              {depositLoading ? 'Processing...' : 'Deposit'}
            </button>
          </form>
        </div>

        <div className="dashboard-card">
          <h3>Transfer Money</h3>
          <form onSubmit={handleTransfer}>
            <input
              type="text"
              placeholder="Recipient User ID"
              value={transferToEmail}
              onChange={(e) => setTransferToEmail(e.target.value)}
              required
              disabled={transferLoading}
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              required
              disabled={transferLoading}
            />
            <button type="submit" disabled={transferLoading}>
              {transferLoading ? 'Processing...' : 'Transfer'}
            </button>
          </form>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Transaction History</h3>
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">No transactions yet</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.type.replace('_', ' ')}</td>
                    <td>${parseFloat(tx.amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Notifications</h3>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="empty-state">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-date">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="mark-read-button"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
