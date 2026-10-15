// ─── localStorage helpers ─────────────────────
const USERS_KEY = 'bank_users';
const TX_KEY = 'bank_transactions';

const read = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const genAccount = () =>
  'ACC' + Math.floor(100000000 + Math.random() * 900000000);

// ─── Auth ─────────────────────────────────────
export function register({ username, password, email }) {
  const users = read(USERS_KEY);
  if (users.find((u) => u.username === username))
    throw new Error('Username already taken');
  if (users.find((u) => u.email === email))
    throw new Error('Email already registered');

  const user = {
    username,
    password, // plain text — fine for demo, NOT for real apps
    email,
    accountNumber: genAccount(),
    balance: 0,
  };
  users.push(user);
  write(USERS_KEY, users);
  return user;
}

export function login({ username, password }) {
  const users = read(USERS_KEY);
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) throw new Error('Invalid username or password');
  return user;
}

// ─── Account ──────────────────────────────────
export function getAccount(username) {
  const user = read(USERS_KEY).find((u) => u.username === username);
  if (!user) throw new Error('User not found');
  return user;
}

function updateUser(username, updater) {
  const users = read(USERS_KEY);
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) throw new Error('User not found');
  users[idx] = updater(users[idx]);
  write(USERS_KEY, users);
  return users[idx];
}

function record(from, to, amount, type) {
  const txs = read(TX_KEY);
  txs.unshift({
    id: Date.now() + Math.random(),
    fromAccount: from,
    toAccount: to,
    amount,
    type,
    timestamp: new Date().toISOString(),
  });
  write(TX_KEY, txs);
}

// ─── Transactions ─────────────────────────────
export function deposit(username, amount) {
  if (!amount || amount <= 0) throw new Error('Invalid amount');
  const user = updateUser(username, (u) => ({
    ...u,
    balance: u.balance + amount,
  }));
  record(null, user.accountNumber, amount, 'DEPOSIT');
  return user;
}

export function withdraw(username, amount) {
  if (!amount || amount <= 0) throw new Error('Invalid amount');
  const current = getAccount(username);
  if (current.balance < amount) throw new Error('Insufficient funds');
  const user = updateUser(username, (u) => ({
    ...u,
    balance: u.balance - amount,
  }));
  record(user.accountNumber, null, amount, 'WITHDRAW');
  return user;
}

export function send(username, toAccountNumber, amount) {
  if (!amount || amount <= 0) throw new Error('Invalid amount');
  const sender = getAccount(username);
  if (sender.accountNumber === toAccountNumber)
    throw new Error('Cannot send to yourself');
  if (sender.balance < amount) throw new Error('Insufficient funds');

  const users = read(USERS_KEY);
  const recipient = users.find((u) => u.accountNumber === toAccountNumber);
  if (!recipient) throw new Error('Recipient account not found');

  const updatedSender = updateUser(username, (u) => ({
    ...u,
    balance: u.balance - amount,
  }));
  updateUser(recipient.username, (u) => ({
    ...u,
    balance: u.balance + amount,
  }));
  record(sender.accountNumber, toAccountNumber, amount, 'TRANSFER');
  return updatedSender;
}

export function getTransactions(accountNumber) {
  return read(TX_KEY).filter(
    (t) => t.fromAccount === accountNumber || t.toAccount === accountNumber
  );
}