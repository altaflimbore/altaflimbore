import { addTransaction, getCurrentUser, readUsers, writeUsers } from './utils.js';

function calculateEmi(principal, annualRatePercent, months) {
  const monthlyRate = (annualRatePercent / 100) / 12;
  if (monthlyRate === 0) return principal / months;
  const pow = Math.pow(1 + monthlyRate, months);
  return principal * monthlyRate * pow / (pow - 1);
}

function handleLoan(e) {
  e.preventDefault();
  const p = Number(document.getElementById('principal').value);
  const r = Number(document.getElementById('interest').value);
  const n = Number(document.getElementById('tenure').value);
  if (!p || p <= 0 || !r || r <= 0 || !n || n <= 0) { alert('Enter valid loan details'); return; }
  const emi = calculateEmi(p, r, n);
  document.getElementById('emiValue').textContent = emi.toFixed(2);
}

function init() {
  document.getElementById('loanForm').addEventListener('submit', handleLoan);
}

document.addEventListener('DOMContentLoaded', init);

