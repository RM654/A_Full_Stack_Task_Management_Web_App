import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Style.css'; // adjust path based on your structure


const AuthPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', form);
      setMessage('Registration successful. Please log in.');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', loginForm);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h1>Admin Page</h1>
      <p style={{ padding: '10px',
      borderRadius: '5px',
      backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
      color: message.includes('successfully') ? '#155724' : '#721c24',
      marginBottom: '1rem',
      border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`, }}>{message}</p>

      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><br />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /><br />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><br />
        <button type="submit">Register</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} /><br />
        <input placeholder="Password" type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AuthPage;
