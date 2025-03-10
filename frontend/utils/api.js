/**
 * API Utilities
 * 
 * Functions for making API calls to the backend
 */

// Base API URL
const API_URL = '/api';

/**
 * Make a GET request to the API
 */
export async function apiGet(endpoint, params = {}) {
  // Convert params to query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `${API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || `API Error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Handle JSON parse error
      const parseError = new Error('Invalid response format from server');
      parseError.originalError = error;
      console.error('API GET Error (Invalid JSON):', error);
      throw parseError;
    }
    
    console.error('API GET Error:', error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 */
export async function apiPost(endpoint, data = {}) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const errorMessage = responseData.message || `API Error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Handle JSON parse error
      const parseError = new Error('Invalid response format from server');
      parseError.originalError = error;
      console.error('API POST Error (Invalid JSON):', error);
      throw parseError;
    }
    
    console.error('API POST Error:', error);
    throw error;
  }
}

/**
 * Make a PUT request to the API
 */
export async function apiPut(endpoint, data = {}) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const errorMessage = responseData.message || `API Error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Handle JSON parse error
      const parseError = new Error('Invalid response format from server');
      parseError.originalError = error;
      console.error('API PUT Error (Invalid JSON):', error);
      throw parseError;
    }
    
    console.error('API PUT Error:', error);
    throw error;
  }
}

/**
 * Make a DELETE request to the API
 */
export async function apiDelete(endpoint) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const errorMessage = responseData.message || `API Error: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      // Handle JSON parse error
      const parseError = new Error('Invalid response format from server');
      parseError.originalError = error;
      console.error('API DELETE Error (Invalid JSON):', error);
      throw parseError;
    }
    
    console.error('API DELETE Error:', error);
    throw error;
  }
}

/**
 * Authentication Functions
 */

/**
 * Login user
 */
export async function login(username, password) {
  return apiPost('auth/login', { username, password });
}

/**
 * Register user
 */
export async function register(username, password, name, email) {
  return apiPost('auth/register', { username, password, name, email });
}

/**
 * Logout user
 */
export async function logout() {
  return apiPost('auth/logout');
}

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  try {
    const response = await apiGet('auth/check');
    return response.data;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

/**
 * Ledger Functions
 */

/**
 * Get all ledgers
 */
export async function getLedgers() {
  const response = await apiGet('ledgers');
  return response.data;
}

/**
 * Get ledger by ID
 */
export async function getLedger(id) {
  try {
    const response = await apiGet(`ledgers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ledger:', error);
    throw error;
  }
}

/**
 * Get ledgers by group type
 */
export async function getLedgersByType(type) {
  const response = await apiGet(`ledgers/by-type/${type}`);
  return response.data;
}

/**
 * Get ledger groups
 */
export async function getLedgerGroups() {
  const response = await apiGet('ledgers/groups');
  return response.data;
}

/**
 * Get net worth
 */
export async function getNetWorth() {
  const response = await apiGet('ledgers/networth');
  return response.data;
}

/**
 * Transaction Functions
 */

/**
 * Get all transactions with optional filtering
 */
export async function getAllTransactions(limit = 100, offset = 0, startDate = null, endDate = null) {
  const params = { limit, offset };
  
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  return apiGet('transactions', params);
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit = 10) {
  const response = await apiGet('transactions/recent', { limit });
  return response.data;
}

/**
 * Get transactions by ledger ID
 */
export async function getTransactionsByLedger(ledgerId, limit = 100, offset = 0) {
  const response = await apiGet(`transactions/ledger/${ledgerId}`, { limit, offset });
  return response.data;
}

/**
 * Get transaction types
 */
export async function getTransactionTypes() {
  const response = await apiGet('transactions/types');
  return response.data;
}

/**
 * Create transaction
 */
export async function createTransaction(data) {
  try {
    // Ensure consistent data format
    const formattedData = {
      ...data,
      // Convert numeric fields to numbers
      amount: parseFloat(data.amount),
      debit_ledger_id: parseInt(data.debit_ledger_id, 10),
      credit_ledger_id: parseInt(data.credit_ledger_id, 10)
    };
    
    const response = await apiPost('transactions', formattedData);
    return response.data ? response.data : response;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

/**
 * Get monthly totals
 */
export async function getMonthlyTotals(year, month) {
  const response = await apiGet('transactions/monthly-totals', { year, month });
  return response.data;
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    const response = await apiGet('profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data) {
  try {
    const response = await apiPut('profile', data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Create ledger group
 */
export async function createLedgerGroup(data) {
  try {
    const response = await apiPost('ledgers/groups', data);
    return response.data;
  } catch (error) {
    console.error('Error creating ledger group:', error);
    throw error;
  }
}

/**
 * Create ledger
 */
export async function createLedger(data) {
  try {
    const response = await apiPost('ledgers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating ledger:', error);
    throw error;
  }
}

/**
 * Get income and expense report
 */
export async function getIncomeExpenseReport(period = 'month') {
  try {
    const response = await apiGet('reports/income-expense', { period });
    return response.data;
  } catch (error) {
    console.error('Error fetching income/expense report:', error);
    throw error;
  }
}

/**
 * Get net worth history
 */
export async function getNetWorthHistory(period = '6m') {
  try {
    const response = await apiGet('reports/net-worth', { period });
    return response.data;
  } catch (error) {
    console.error('Error fetching net worth history:', error);
    throw error;
  }
}

/**
 * Get credit card dues
 */
export async function getCreditCardDues() {
  try {
    const response = await apiGet('reports/credit-card-dues');
    return response.data;
  } catch (error) {
    console.error('Error fetching credit card dues:', error);
    throw error;
  }
}

/**
 * Get monthly summary
 */
export async function getMonthlySummary(period = '6m') {
  try {
    const response = await apiGet('reports/monthly-summary', { period });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    throw error;
  }
}

/**
 * Get transaction by ID
 */
export async function getTransaction(id) {
  try {
    const response = await apiGet(`transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Update transaction
 */
export async function updateTransaction(id, data) {
  try {
    // Ensure consistent data format
    const formattedData = {
      ...data,
      // Convert numeric fields to numbers
      amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      debit_ledger_id: typeof data.debit_ledger_id === 'string' ? parseInt(data.debit_ledger_id, 10) : data.debit_ledger_id,
      credit_ledger_id: typeof data.credit_ledger_id === 'string' ? parseInt(data.credit_ledger_id, 10) : data.credit_ledger_id,
    };
    
    const response = await apiPut(`transactions/${id}/update`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id) {
  try {
    const response = await apiDelete(`transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

/**
 * Update ledger
 */
export async function updateLedger(id, data) {
  try {
    // Ensure consistent data format
    const formattedData = {
      ...data,
      // Convert numeric fields to numbers
      group_id: typeof data.group_id === 'string' ? parseInt(data.group_id, 10) : data.group_id,
      opening_balance: typeof data.opening_balance === 'string' ? parseFloat(data.opening_balance) : data.opening_balance || 0,
    };
    
    const response = await apiPut(`ledgers/${id}/update`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating ledger:', error);
    throw error;
  }
}

/**
 * Delete ledger
 */
export async function deleteLedger(id) {
  try {
    const response = await apiDelete(`ledgers/${id}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ledger:', error);
    throw error;
  }
}

/**
 * Get ledger group
 */
export async function getLedgerGroup(id) {
  try {
    const response = await apiGet(`ledgers/group/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ledger group:', error);
    throw error;
  }
}

/**
 * Update ledger group
 */
export async function updateLedgerGroup(id, data) {
  try {
    const response = await apiPut(`ledgers/group/${id}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating ledger group:', error);
    throw error;
  }
}

/**
 * Delete ledger group
 */
export async function deleteLedgerGroup(id, options = {}) {
  try {
    // If reassignTo is specified, send it as a query parameter
    let endpoint = `ledgers/group/${id}/delete`;
    if (options.reassignTo) {
      endpoint += `?reassign_to=${options.reassignTo}`;
    }
    if (options.deleteTransactions) {
      endpoint += `${options.reassignTo ? '&' : '?'}delete_transactions=1`;
    }
    
    const response = await apiDelete(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error deleting ledger group:', error);
    throw error;
  }
}

/**
 * Create database backup
 */
export async function createBackup() {
  try {
    const response = await apiGet('backup');
    return response;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
} 