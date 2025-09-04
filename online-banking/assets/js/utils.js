// Aurora Bank - Utilities and Storage

export const STORAGE_KEYS = {
  users: 'ab_users',
  currentUserId: 'ab_currentUser',
  theme: 'ab_theme'
};

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function readUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

export function writeUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

export function getCurrentUser() {
  const id = localStorage.getItem(STORAGE_KEYS.currentUserId);
  if (!id) return null;
  return readUsers().find(u => u.id === id) || null;
}

export function setCurrentUser(userId) {
  if (userId) localStorage.setItem(STORAGE_KEYS.currentUserId, userId);
  else localStorage.removeItem(STORAGE_KEYS.currentUserId);
}

export function generateAccountNumber() {
  const base = Math.floor(1000000000 + Math.random() * 9000000000);
  return 'AB' + String(base);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(amount || 0));
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function addTransaction(userId, tx) {
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;
  user.transactions = user.transactions || [];
  user.transactions.unshift({ id: uuid(), date: new Date().toISOString(), ...tx });
  writeUsers(users);
}

export function updateUser(userId, updates) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  writeUsers(users);
}

export function guardAuth() {
  const user = getCurrentUser();
  if (!user || user.role !== 'user') {
    window.location.replace('index.html');
    return;
  }
  if (user.status !== 'active') {
    alert('Your account is not approved yet. Please wait for admin approval.');
    setCurrentUser(null);
    window.location.replace('index.html');
  }
}

export function guardAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.replace('admin-login.html');
  }
}

export function attachLogout() {
  const link = document.getElementById('logoutLink');
  if (link) link.addEventListener('click', (e) => { e.preventDefault(); setCurrentUser(null); window.location.replace('index.html'); });
}

export function initializeTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEYS.theme, next);
    });
  }
}

export function filterTransactions(transactions, { type, start, end }) {
  return (transactions || []).filter(tx => {
    if (type && tx.type !== type) return false;
    const time = new Date(tx.date).getTime();
    if (start && time < new Date(start).getTime()) return false;
    if (end && time > new Date(end).getTime()) return false;
    return true;
  });
}

export function exportTransactionsCsv(transactions) {
  const headers = ['Date', 'Type', 'Note', 'Amount'];
  const rows = (transactions || []).map(tx => [formatDate(tx.date), tx.type, tx.note || '', String(tx.amount)]);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'transactions.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function seedDataIfEmpty() {
  const users = readUsers();
  if (users.length > 0) return;
  const admin = {
    id: uuid(), name: 'Admin', email: 'admin@bank.com', password: 'admin123', role: 'admin', accountNumber: 'ADMIN', balance: 0, status: 'active', createdAt: new Date().toISOString(), transactions: []
  };
  const demo = {
    id: uuid(), name: 'Jane Doe', email: 'demo@bank.com', password: 'demo123', role: 'user', accountNumber: generateAccountNumber(), balance: 1500, status: 'active', createdAt: new Date().toISOString(), transactions: []
  };
  const second = {
    id: uuid(), name: 'John Smith', email: 'john@bank.com', password: 'john123', role: 'user', accountNumber: generateAccountNumber(), balance: 800, status: 'active', createdAt: new Date().toISOString(), transactions: []
  };
  demo.transactions.push({ id: uuid(), date: new Date().toISOString(), type: 'Deposit', amount: 1500, note: 'Initial funding' });
  writeUsers([admin, demo, second]);
}

export function getAllTransactionsWithUser() {
  const users = readUsers();
  const list = [];
  for (const u of users) {
    for (const tx of (u.transactions || [])) {
      list.push({ userId: u.id, userEmail: u.email, userName: u.name, ...tx });
    }
  }
  return list;
}

export function detectSuspiciousTransactions({ amountThreshold = 5000 } = {}) {
  const all = getAllTransactionsWithUser();
  return all.filter(tx => Number(tx.amount) >= amountThreshold);
}

