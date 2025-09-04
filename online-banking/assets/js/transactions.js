import { getCurrentUser, filterTransactions, exportTransactionsCsv, formatCurrency, formatDate } from './utils.js';

function renderTable(transactions) {
  const tbody = document.getElementById('txTable');
  tbody.innerHTML = '';
  transactions.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatDate(tx.date)}</td><td>${tx.type}</td><td>${tx.note || ''}</td><td>${formatCurrency(tx.amount)}</td>`;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  const user = getCurrentUser();
  const type = document.getElementById('filterType').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  const filtered = filterTransactions(user.transactions || [], { type, start, end });
  renderTable(filtered);
}

function resetFilters() {
  document.getElementById('filterType').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  applyFilters();
}

function exportCsv() {
  const user = getCurrentUser();
  exportTransactionsCsv(user.transactions || []);
}

function init() {
  const user = getCurrentUser();
  renderTable(user.transactions || []);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
}

document.addEventListener('DOMContentLoaded', init);

