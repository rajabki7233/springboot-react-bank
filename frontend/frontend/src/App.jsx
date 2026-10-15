import { useEffect, useState } from 'react';

const API = 'http://localhost:8080/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('bank_current') || null
  );
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [msg, setMsg] = useState('');
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [isRegister, setIsRegister] = useState(false);

  const refresh = async () => {
    if (!currentUser) return;
    const res = await fetch(`${API}/account/${currentUser}`);
    if (res.ok) setAccount(await res.json());
    else logout();
  };

  useEffect(() => { refresh(); }, [currentUser]);

  const call = async (path, body) => {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const user = await call('/login', {
        username: authForm.username,
        password: authForm.password,
      });
      localStorage.setItem('bank_current', user.username);
      setCurrentUser(user.username);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const user = await call('/register', authForm);
      localStorage.setItem('bank_current', user.username);
      setCurrentUser(user.username);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('bank_current');
    setCurrentUser(null);
    setAccount(null);
  };

  const doAction = async (path, body) => {
    setMsg('');
    try {
      await call(path, { username: currentUser, ...body });
      setMsg('Success');
      setAmount('');
      setToAccount('');
      refresh();
    } catch (err) {
      setMsg(err.message);
    }
  };

  // ─── Login / Register ───
  if (!currentUser) {
    return (
      <div style={styles.center}>
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={styles.card}>
          <h2>🏦 {isRegister ? 'Create Account' : 'Bank Login'}</h2>
          {msg && <p style={{ color: 'red', margin: 0 }}>{msg}</p>}
          <input style={styles.input} placeholder="Username"
            value={authForm.username}
            onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} required />
          {isRegister && (
            <input style={styles.input} type="email" placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
          )}
          <input style={styles.input} type="password" placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
          <button style={styles.btn} type="submit">{isRegister ? 'Register' : 'Login'}</button>
          <p style={{ fontSize: 13, color: '#007bff', cursor: 'pointer', margin: 0 }}
             onClick={() => { setIsRegister(!isRegister); setMsg(''); }}>
            {isRegister ? 'Have an account? Login' : 'No account? Register'}
          </p>
        </form>
      </div>
    );
  }

  if (!account) return <div style={styles.center}>Loading...</div>;

  // ─── Dashboard ───
  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏦 My Bank</h1>
        <button style={styles.logout} onClick={logout}>Logout</button>
      </div>

      <div style={styles.balance}>
        <p style={{ margin: '4px 0' }}>Account: <b>{account.accountNumber}</b></p>
        <p style={{ margin: '4px 0' }}>Hello, {account.username}</p>
        <h2 style={{ fontSize: 40, margin: '10px 0' }}>${account.balance.toFixed(2)}</h2>
      </div>

      {msg && <p style={{ padding: 10, background: '#e8f4ff', borderRadius: 5 }}>{msg}</p>}

      <div style={styles.row}>
        <div style={styles.box}>
          <h3>Deposit</h3>
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={styles.green}
            onClick={() => doAction('/deposit', { amount: parseFloat(amount) })}>Deposit</button>
        </div>

        <div style={styles.box}>
          <h3>Withdraw</h3>
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={styles.red}
            onClick={() => doAction('/withdraw', { amount: parseFloat(amount) })}>Withdraw</button>
        </div>

        <div style={styles.box}>
          <h3>Send Money</h3>
          <input style={styles.input} placeholder="Recipient account #"
            value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Amount"
            value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button style={styles.blue}
            onClick={() => doAction('/send', { toAccountNumber: toAccount, amount: parseFloat(amount) })}>Send</button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#666', marginTop: 20 }}>
        Data is stored in H2 (in-memory) — it resets every time the backend restarts.
      </p>
    </div>
  );
}

const styles = {
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  card: { background: 'white', padding: 30, borderRadius: 10, width: 300, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  input: { padding: 10, border: '1px solid #ccc', borderRadius: 5, fontSize: 14 },
  btn: { padding: 10, background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 15 },
  logout: { padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
  balance: { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: 20, borderRadius: 10, margin: '10px 0' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 15, margin: '15px 0' },
  box: { background: 'white', padding: 15, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  green: { padding: 8, background: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
  red: { padding: 8, background: '#dc3545', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
  blue: { padding: 8, background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' },
};