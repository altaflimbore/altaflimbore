import { getCurrentUser, readUsers, writeUsers, addTransaction } from './utils.js';

function validateExpiry(expiry) {
  return /^\d{2}\/\d{2}$/.test(expiry);
}

function handleCardPayment(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const type = document.getElementById('cardType').value;
  const number = document.getElementById('cardNumber').value.trim();
  const name = document.getElementById('cardName').value.trim();
  const expiry = document.getElementById('expiry').value.trim();
  const cvv = document.getElementById('cvv').value.trim();
  const amount = Number(document.getElementById('cardAmount').value);
  if (!type || number.length !== 16 || !name || !validateExpiry(expiry) || cvv.length < 3 || !amount || amount <= 0) {
    alert('Please fill all card details correctly');
    return;
  }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) - amount;
  writeUsers(users);
  const success = Math.random() > 0.1;
  if (!success) { alert('Payment failed. Try again.'); return; }
  addTransaction(user.id, { type: 'Card Payment', amount: -amount, note: `${type} •••• ${number.slice(-4)}` });
  alert('Payment successful');
  window.location.reload();
}

function handleUpi() {
  const user = getCurrentUser();
  if (!user) return;
  const upi = document.getElementById('upiId').value.trim();
  const amount = Number(document.getElementById('upiAmount').value);
  if (!upi || !upi.includes('@') || !amount || amount <= 0) { alert('Enter valid UPI and amount'); return; }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) - amount;
  writeUsers(users);
  const success = Math.random() > 0.05;
  if (!success) { alert('UPI payment failed. Try again.'); return; }
  addTransaction(user.id, { type: 'UPI Payment', amount: -amount, note: `UPI ${upi}` });
  alert('UPI payment successful');
  window.location.reload();
}

function handleNetBanking() {
  const user = getCurrentUser();
  if (!user) return;
  const amount = Number(document.getElementById('upiAmount').value);
  if (!amount || amount <= 0) { alert('Enter amount'); return; }
  if (amount > Number(user.balance)) { alert('Insufficient balance'); return; }
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx].balance = Number(users[idx].balance) - amount;
  writeUsers(users);
  addTransaction(user.id, { type: 'Card Payment', amount: -amount, note: 'Net Banking' });
  alert('Net banking payment successful');
  window.location.reload();
}

function init() {
  document.getElementById('cardForm').addEventListener('submit', handleCardPayment);
  document.getElementById('upiPay').addEventListener('click', handleUpi);
  document.getElementById('netBankingPay').addEventListener('click', handleNetBanking);
}

document.addEventListener('DOMContentLoaded', init);

