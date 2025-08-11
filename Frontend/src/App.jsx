import React, { useState, useEffect } from 'react';
import {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
} from './services/employeeService.js';
import { getStats } from './Services/statsService.js';
import { getLatestNotification } from './Services/notificationService.js';
import Swal from 'sweetalert2';

import EmployeeForm from './components/EmployeeForm.jsx';
import EmployeeSearch from './components/EmployeeSearch.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import AuthPage from './components/AuthPage.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', department: '' });
  const [editData, setEditData] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchEmployees();
      fetchStats();
      fetchNotification();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchNotification, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees(token);
      if (response.status !== 200) throw new Error();
      const data = response.data.filter(emp => emp && emp.name?.trim());
      setEmployees(data || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getStats(token);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchNotification = async () => {
    try {
      const response = await getLatestNotification();
      if (!response || !response.notification) return;
      setNotification(response.notification);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, department } = form;
    if (!name || !email || !department) {
      return Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'All fields are required',
      });
    }
    try {
      const response = editData
        ? await updateEmployee(editData._id, { name, email, department }, token)
        : await addEmployee({ name, email, department }, token);
      if (![200, 201].includes(response.status)) throw new Error();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Employee ${editData ? 'updated' : 'added'} successfully!`,
      });
      setForm({ name: '', email: '', department: '' });
      setEditData(null);
      fetchEmployees();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  const handleEdit = (emp) => {
    setEditData(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      department: emp.department,
    });
  };

  const handleDelete = async (emp) => {
    try {
      const response = await deleteEmployee(emp._id, token);
      if (response.status !== 200) throw new Error();
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Employee deleted successfully!',
      });
      fetchEmployees();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIsSearching(true);
    try {
      const response = await getEmployeeById(searchId.trim(), token);
      if (response.status !== 200) throw new Error();
      setEmployees([response.data]);
    } catch {
      setEmployees([]);
      Swal.fire({
        icon: 'info',
        title: 'Not Found',
        text: `No employee found with ID ${searchId}`,
      });
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setIsSearching(false);
    fetchEmployees();
    fetchStats();
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <AuthPage onLogin={(user, token) => {
      setUser(user);
      setToken(token);
    }} />;
  }

  const neonColors = {
    primary: '#00fff7',
    secondary: '#ff6f91',
    background: '#0d1117',
    card: '#161b22',
    accent: '#39ff14',
    alertBg: '#1a1f2b',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: neonColors.background,
        color: '#c9d1d9',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `2px solid ${neonColors.primary}`,
          paddingBottom: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontWeight: '700', fontSize: '1.25rem' }}>
          <span role="img" aria-label="user">👤</span> {user.name}
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: `2px solid ${neonColors.secondary}`,
            color: neonColors.secondary,
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = neonColors.secondary;
            e.currentTarget.style.color = neonColors.background;
            e.currentTarget.style.boxShadow = `0 0 10px ${neonColors.secondary}`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = neonColors.secondary;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Logout
        </button>
      </header>

      {/* Title */}
      <h1
        style={{
          fontSize: '2.8rem',
          fontWeight: '900',
          color: neonColors.primary,
          textAlign: 'center',
          textShadow: `0 0 8px ${neonColors.primary}`,
          marginBottom: '2rem',
          userSelect: 'text',
        }}
      >
        Employee Manager
      </h1>

      {/* Notification */}
      {notification && (
        <div
          style={{
            backgroundColor: neonColors.alertBg,
            borderRadius: '10px',
            padding: '1rem',
            color: neonColors.accent,
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: `0 0 12px ${neonColors.accent}`,
            marginBottom: '1rem',
            userSelect: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
          role="alert"
        >
          <span style={{fontSize: '1.3rem'}}>📢</span>
          <span>
            Admin notified:{' '}
            {{
              'employee:add': 'New Employee Added',
              'employee:update': 'Employee Updated',
              'employee:delete': 'Employee Deleted',
            }[notification.type]} → <strong>{notification.name}</strong>
          </span>
        </div>
      )}

      {/* Employee Form */}
      <div
        style={{
          backgroundColor: neonColors.card,
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: `0 0 15px ${neonColors.primary}`,
        }}
      >
        <EmployeeForm
          form={form}
          editData={editData}
          handleChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          handleSubmit={handleSubmit}
          onCancel={() => {
            setForm({ name: '', email: '', department: '' });
            setEditData(null);
          }}
          futuristic={true}
          neonColors={neonColors}
        />
      </div>

      {/* Search */}
      <div
        style={{
          backgroundColor: neonColors.card,
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: `0 0 12px ${neonColors.secondary}`,
          marginTop: '1rem',
        }}
      >
        <EmployeeSearch
          searchId={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onSearch={handleSearch}
          onClear={clearSearch}
          isSearching={isSearching}
          neonColors={neonColors}
        />
      </div>

      {/* Employee Table */}
      <div
        style={{
          backgroundColor: neonColors.card,
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: `0 0 18px ${neonColors.primary}`,
          marginTop: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <EmployeeTable
          employees={employees}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          neonColors={neonColors}
        />
      </div>

      {/* Analytics */}
      {stats && (
        <div
          style={{
            marginTop: '2rem',
            backgroundColor: neonColors.card,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: `0 0 15px ${neonColors.secondary}`,
            userSelect: 'text',
          }}
        >
          <h5
            style={{
              color: neonColors.secondary,
              fontWeight: '700',
              marginBottom: '1rem',
              textShadow: `0 0 6px ${neonColors.secondary}`,
            }}
          >
            📊 API Usage Analytics
          </h5>
          <ul
            style={{
              listStyle: 'none',
              paddingLeft: 0,
              color: '#adbac7',
              fontSize: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
            }}
          >
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Logins: {stats['analytics:logins']}
            </li>
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Registrations: {stats['analytics:registers']}
            </li>
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Fetched Employees: {stats['analytics:getEmployees']}
            </li>
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Added Employees: {stats['analytics:addEmployee']}
            </li>
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Updated Employees: {stats['analytics:updateEmployee']}
            </li>
            <li style={{ background: '#22272e', borderRadius: '8px', padding: '0.5rem 1rem', boxShadow: `0 0 6px ${neonColors.secondary}` }}>
              Deleted Employees: {stats['analytics:deleteEmployee']}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
