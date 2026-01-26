import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

/**
 * Generate a random email address
 */
export function generateEmail() {
  return `user_${randomString(8)}_${Date.now()}@test.com`;
}

/**
 * Generate a random name
 */
export function generateName() {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  return `${firstNames[randomIntBetween(0, firstNames.length - 1)]} ${lastNames[randomIntBetween(0, lastNames.length - 1)]}`;
}

/**
 * Create a new user and return the user ID
 */
export function createUser(baseUrl) {
  const payload = JSON.stringify({
    name: generateName(),
    email: generateEmail(),
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${baseUrl}/api/users`, payload, params);
  
  const success = check(response, {
    'user created successfully': (r) => r.status === 201,
    'response has user id': (r) => {
      if (r.status === 201) {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  if (success && response.status === 201) {
    const body = JSON.parse(response.body);
    return body.id;
  }

  return null;
}

/**
 * Get user by ID
 */
export function getUser(baseUrl, userId) {
  const response = http.get(`${baseUrl}/api/users/${userId}`);
  
  check(response, {
    'get user status is 200': (r) => r.status === 200,
    'response has user data': (r) => {
      if (r.status === 200) {
        try {
          const body = JSON.parse(r.body);
          return body.id === userId;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  return response.status === 200;
}

/**
 * Get wallet balance for a user
 */
export function getBalance(baseUrl, userId) {
  const response = http.get(`${baseUrl}/api/wallets/${userId}/balance`);
  
  check(response, {
    'get balance status is 200': (r) => r.status === 200,
    'response has balance': (r) => {
      if (r.status === 200) {
        try {
          const body = JSON.parse(r.body);
          return typeof body.balance === 'number';
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  return response.status === 200;
}

/**
 * Deposit funds to a user's wallet
 */
export function deposit(baseUrl, userId, amount) {
  const payload = JSON.stringify({
    amount: amount,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${baseUrl}/api/wallets/${userId}/deposit`, payload, params);
  
  check(response, {
    'deposit status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'deposit successful': (r) => {
      if (r.status === 200 || r.status === 201) {
        try {
          const body = JSON.parse(r.body);
          return body.success !== false;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  return response.status === 200 || response.status === 201;
}

/**
 * Transfer funds between two users
 */
export function transfer(baseUrl, fromUserId, toUserId, amount) {
  const payload = JSON.stringify({
    fromUserId: fromUserId,
    toUserId: toUserId,
    amount: amount,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const response = http.post(`${baseUrl}/api/transactions/transfer`, payload, params);
  
  check(response, {
    'transfer status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'transfer successful': (r) => {
      if (r.status === 200 || r.status === 201) {
        try {
          const body = JSON.parse(r.body);
          return body.success !== false;
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  return response.status === 200 || response.status === 201;
}

/**
 * Get transaction history for a user
 */
export function getTransactionHistory(baseUrl, userId, page = 1, pageSize = 10) {
  const response = http.get(`${baseUrl}/api/transactions/${userId}?page=${page}&pageSize=${pageSize}`);
  
  check(response, {
    'get transaction history status is 200': (r) => r.status === 200,
    'response has transactions': (r) => {
      if (r.status === 200) {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.transactions) || Array.isArray(body);
        } catch (e) {
          return false;
        }
      }
      return false;
    },
  });

  return response.status === 200;
}

/**
 * Execute a full user flow scenario
 */
export function executeUserFlow(baseUrl) {
  // Create a user
  const userId = createUser(baseUrl);
  if (!userId) {
    console.error('Failed to create user');
    return false;
  }
  sleep(1);

  // Get user info
  getUser(baseUrl, userId);
  sleep(0.5);

  // Check initial balance (should be 0)
  getBalance(baseUrl, userId);
  sleep(0.5);

  // Deposit some funds
  const depositAmount = randomIntBetween(100, 1000);
  deposit(baseUrl, userId, depositAmount);
  sleep(1);

  // Check balance after deposit
  getBalance(baseUrl, userId);
  sleep(0.5);

  // Create another user for transfer
  const recipientId = createUser(baseUrl);
  if (!recipientId) {
    console.error('Failed to create recipient user');
    return false;
  }
  sleep(1);

  // Deposit to recipient
  deposit(baseUrl, recipientId, randomIntBetween(100, 500));
  sleep(1);

  // Transfer funds
  const transferAmount = randomIntBetween(10, 100);
  transfer(baseUrl, userId, recipientId, transferAmount);
  sleep(1);

  // Get transaction history
  getTransactionHistory(baseUrl, userId);
  sleep(0.5);

  return true;
}
