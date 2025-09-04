// Aurora Bank - Authentication logic
import { readUsers, writeUsers, setCurrentUser, seedDataIfEmpty, generateAccountNumber, uuid, STORAGE_KEYS } from './utils.js';

function findUserByEmail(email) {
  return readUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
}

function handleLogin(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  const user = findUserByEmail(email);
  if (!user || user.password !== password || user.role !== 'user') {
    alert('Invalid credentials.');
    return;
  }
  if (user.status !== 'active') {
    alert('Account not approved yet. Please wait for admin approval.');
    return;
  }
  setCurrentUser(user.id);
  window.location.replace('dashboard.html');
}

function handleAdminLogin(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  const user = findUserByEmail(email);
  if (!user || user.password !== password || user.role !== 'admin') {
    alert('Invalid admin credentials.');
    return;
  }
  setCurrentUser(user.id);
  window.location.replace('admin.html');
}

function handleSignup(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.name.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;
  if (findUserByEmail(email)) {
    alert('An account with this email already exists.');
    return;
  }
  const users = readUsers();
  const newUser = {
    id: uuid(), name, email, password, role: 'user', accountNumber: generateAccountNumber(), balance: 0, status: 'pending', createdAt: new Date().toISOString(), transactions: []
  };
  users.push(newUser);
  writeUsers(users);
  alert('Signup successful. Your account is pending approval by admin.');
  window.location.replace('index.html');
}

function handleReset(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const email = form.email.value.trim();
  const newPassword = form.newPassword.value;
  const users = readUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) {
    alert('No account found for this email');
    return;
  }
  users[idx].password = newPassword;
  writeUsers(users);
  alert('Password reset successful. Please login with your new password.');
  window.location.replace('index.html');
}

function init() {
  seedDataIfEmpty();
  const loginForm = document.getElementById('loginForm');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const signupForm = document.getElementById('signupForm');
  const resetForm = document.getElementById('resetForm');
  loginForm?.addEventListener('submit', handleLogin);
  adminLoginForm?.addEventListener('submit', handleAdminLogin);
  signupForm?.addEventListener('submit', handleSignup);
  resetForm?.addEventListener('submit', handleReset);
}

document.addEventListener('DOMContentLoaded', init);

