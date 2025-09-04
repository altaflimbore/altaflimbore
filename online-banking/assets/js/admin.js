import { readUsers, writeUsers, detectSuspiciousTransactions, formatCurrency, formatDate } from './utils.js';

function renderPending() {
  const tbody = document.getElementById('pendingTable');
  tbody.innerHTML = '';
  const users = readUsers().filter(u => u.role === 'user' && u.status !== 'active');
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>
      <button class="btn btn-success" data-approve="${u.id}">Approve</button>
      <button class="btn btn-danger" data-reject="${u.id}">Reject</button>
    </td>`;
    tbody.appendChild(tr);
  });
}

function renderUsers() {
  const tbody = document.getElementById('usersTable');
  tbody.innerHTML = '';
  readUsers().filter(u => u.role === 'user').forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.accountNumber}</td><td>${formatCurrency(u.balance)}</td>
    <td><span class="badge ${u.status === 'active' ? 'success' : 'danger'}">${u.status}</span></td>`;
    tbody.appendChild(tr);
  });
}

function renderSuspicious() {
  const tbody = document.getElementById('suspiciousTable');
  tbody.innerHTML = '';
  detectSuspiciousTransactions({ amountThreshold: 3000 }).forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${tx.userName} (${tx.userEmail})</td><td>${formatDate(tx.date)}</td><td>${tx.type}</td><td>${formatCurrency(tx.amount)}</td><td>${tx.note || ''}</td>`;
    tbody.appendChild(tr);
  });
}

function bindActions() {
  document.getElementById('pendingTable').addEventListener('click', (e) => {
    const approveId = e.target.closest('[data-approve]')?.getAttribute('data-approve');
    const rejectId = e.target.closest('[data-reject]')?.getAttribute('data-reject');
    if (approveId) {
      const users = readUsers();
      const idx = users.findIndex(u => u.id === approveId);
      if (idx !== -1) { users[idx].status = 'active'; writeUsers(users); renderPending(); renderUsers(); alert('User approved'); }
    }
    if (rejectId) {
      const users = readUsers();
      const idx = users.findIndex(u => u.id === rejectId);
      if (idx !== -1) { users[idx].status = 'rejected'; writeUsers(users); renderPending(); renderUsers(); alert('User rejected'); }
    }
  });
}

function init() {
  renderPending();
  renderUsers();
  renderSuspicious();
  bindActions();
}

document.addEventListener('DOMContentLoaded', init);

