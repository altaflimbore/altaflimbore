import { getCurrentUser, readUsers, writeUsers, addTransaction, formatCurrency } from './utils.js';

function handleBillSubmit(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const category = document.getElementById('billCategory').value;
  const amount = Number(document.getElementById('billAmount').value);
  if (!category) { alert('Choose a category'); return; }
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return; }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) - amount;
  writeUsers(users);
  addTransaction(user.id, { type: 'Bill Payment', amount: -amount, note: `${category} bill` });
  alert(`Bill paid: ${category} ${formatCurrency(amount)}`);
  window.location.reload();
}

function initCategoryShortcuts() {
  document.querySelectorAll('.bill-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('billCategory').value = card.dataset.category;
      document.getElementById('billAmount').focus();
    });
  });
}

function init() {
  document.getElementById('billForm').addEventListener('submit', handleBillSubmit);
  initCategoryShortcuts();
}

document.addEventListener('DOMContentLoaded', init);

