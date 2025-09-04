import { getCurrentUser, readUsers, writeUsers, addTransaction, updateUser, formatCurrency, formatDate } from './utils.js';

function renderOverview(user) {
  document.getElementById('userName').textContent = user.name.split(' ')[0];
  document.getElementById('accountNumber').textContent = user.accountNumber;
  document.getElementById('balanceValue').textContent = formatCurrency(user.balance);
}

function renderRecent(user) {
  const tbody = document.getElementById('recentTransactions');
  tbody.innerHTML = '';
  (user.transactions || []).slice(0, 8).forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatDate(tx.date)}</td><td>${tx.type}</td><td>${tx.note || ''}</td><td>${formatCurrency(tx.amount)}</td>`;
    tbody.appendChild(tr);
  });
}

function showModal(id) {
  document.getElementById(id).classList.add('show');
}
function closeModal(e) {
  const modal = e.target.closest('.modal');
  modal?.classList.remove('show');
}

function bindModals() {
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
  document.getElementById('openDeposit').addEventListener('click', () => showModal('depositModal'));
  document.getElementById('openWithdraw').addEventListener('click', () => showModal('withdrawModal'));
  document.getElementById('openTransfer').addEventListener('click', () => showModal('transferModal'));
}

function submitDeposit(e, user) {
  e.preventDefault();
  const amount = Number(document.getElementById('depositAmount').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) + amount;
  writeUsers(users);
  addTransaction(user.id, { type: 'Deposit', amount, note: 'Deposit to account' });
  location.reload();
}

function submitWithdraw(e, user) {
  e.preventDefault();
  const amount = Number(document.getElementById('withdrawAmount').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) - amount;
  writeUsers(users);
  addTransaction(user.id, { type: 'Withdraw', amount: -amount, note: 'Cash withdrawal' });
  location.reload();
}

function submitTransfer(e, user) {
  e.preventDefault();
  const email = document.getElementById('receiverEmail').value.trim().toLowerCase();
  const amount = Number(document.getElementById('transferAmount').value);
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const senderIdx = users.findIndex(u => u.id === user.id);
  const receiverIdx = users.findIndex(u => u.email.toLowerCase() === email && u.role === 'user');
  if (receiverIdx === -1) { alert('Receiver not found'); return; }
  users[senderIdx].balance = Number(users[senderIdx].balance) - amount;
  users[receiverIdx].balance = Number(users[receiverIdx].balance) + amount;
  writeUsers(users);
  addTransaction(user.id, { type: 'Transfer', amount: -amount, note: `To ${users[receiverIdx].email}` });
  addTransaction(users[receiverIdx].id, { type: 'Transfer', amount: amount, note: `From ${users[senderIdx].email}` });
  alert('Transfer successful');
  location.reload();
}

function init() {
  const user = getCurrentUser();
  if (!user) return;
  bindModals();
  renderOverview(user);
  renderRecent(user);
  document.getElementById('depositForm').addEventListener('submit', (e) => submitDeposit(e, user));
  document.getElementById('withdrawForm').addEventListener('submit', (e) => submitWithdraw(e, user));
  document.getElementById('transferForm').addEventListener('submit', (e) => submitTransfer(e, user));
}

document.addEventListener('DOMContentLoaded', init);

