import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={submit} style={styles.card}>
        <h2>🏦 Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input style={styles.input} type="email" placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input style={styles.input} type="password" placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button style={styles.btn} type="submit">Register</button>
        <p>Have account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  card: { background: 'white', padding: 30, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: 320, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: 10, border: '1px solid #ccc', borderRadius: 5, fontSize: 14 },
  btn: { padding: 12, background: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 16 },
  error: { color: 'red', fontSize: 13 },
};