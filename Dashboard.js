import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeForm from '../components/EmployeeForm';
import { useNavigate } from 'react-router-dom';
import '../Style.css'; // adjust path based on your structure


const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUsers(res.data))
      .catch(() => setMessage('Failed to fetch users. Maybe token expired.'));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h1>Dashboard</h1>
      <p>{message}</p>
      <button onClick={handleLogout}>Logout</button>

      <h2>Add New Employee</h2>
      <EmployeeForm token={token} />
    </div>
  );
};

export default Dashboard;
