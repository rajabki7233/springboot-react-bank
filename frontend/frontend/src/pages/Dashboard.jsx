import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccount, deposit, withdraw, send, getTransactions } from '../api';

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const nav = useNavigate();

  const load = async () => {
    try {
      const acc = await getAccount();
      setAccount(acc.data);
      const tx = await getTransactions();
      setTransactions(tx.data);
    } catch {
      logout();
    }
  };

  useEffect(() => { load(); }, []);

  const handle = async (fn, ...args) => {
    setMsg({ type: '', text: '' });
    try {
      await fn(...args);
      setMsg({ type: 'success', text: 'Transaction successful' });
      setAmount('');
      setToAccount('');
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transaction failed' });
    }
  };

  const logout = () => {
    localStorage.clear();
    nav('/login');
  };

  if (!account) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>🏦 My Bank</h1>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>

      <div style={styles.balanceCard}>
        <p>Account: {account.accountNumber}</p>
        <p>Welcome, <b>{account.username}</b></p>
        <h2 style={{ fontSize: 42, margin: '10px 0' }}>
          ${Number(account.balance).toFixed(2)}
        </h2>
      </div>

      {msg.text && (
        <div style={{
          ...styles.msg,
          background: msg.type === 'success' ? '#d4edda' : '#f8d7da',
          color: msg.type === 'success' ? '#155724' : '#721c24',
        }}>
          {msg.text}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>💰 Deposit</h3>
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={{ ...styles.btn, background: '#28a745' }}
            onClick={() => handle(deposit, parseFloat(amount))}>Deposit</button>
        </div>

        <div style={styles.card}>
          <h3>💸 Withdraw</h3>
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={{ ...styles.btn, background: '#dc3545' }}
            onClick={() => handle(withdraw, parseFloat(amount))}>Withdraw</button>
        </div>

        <div style={styles.card}>
          <h3>📤 Send Money</h3>
          <input style={styles.input} placeholder="Recipient Account #"
            value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={{ ...styles.btn, background: '#007bff' }}
            onClick={() => handle(send, parseFloat(amount), toAccount)}>Send</button>
        </div>
      </div>

      <div style={styles.card}>
        <h3>📜 Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>From</th>
                <th style={styles.th}>To</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={styles.td}>{t.type}</td>
                  <td style={styles.td}>${Number(t.amount).toFixed(2)}</td>
                  <td style={styles.td}>{t.fromAccount || '-'}</td>
                  <td style={styles.td}>{t.toAccount || '-'}</td>
                  <td style={styles.td}>{new Date(t.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1000, margin: '0 auto', padding: 20, fontFamily: 'Arial' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logout: { padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
  balanceCard: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: 30, borderRadius: 12, marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 20 },
  card: { background: 'white', padding: 20, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  input: { padding: 10, border: '1px solid #ccc', borderRadius: 5 },
  btn: { padding: 10, color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 15 },
  msg: { padding: 12, borderRadius: 5, marginBottom: 15 },
  th: { padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' },
  td: { padding: 10, borderBottom: '1px solid #eee' },
};