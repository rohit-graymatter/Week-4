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

  // Poll every 5 seconds for latest notification
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchNotification();
    }, 5000);

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

      // response should be like: { notification: { name, type, ... } }
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

  return (
    <div className="py-5" style={{ minHeight: '100vh', backgroundColor: '#f4f7fa', padding: '48px' }}>
      <div>
        <span className="me-3 fw-bold">👤 {user.name}</span>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
      </div>

      <div className="d-flex justify-content-center align-items-center mb-4">
        <h1 className="text-center">Employee Manager</h1>
      </div>

      {notification && (
        <div className="alert alert-info mt-3" role="alert">
          📢 Admin notified: {' '}
          {{
            'employee:add': 'New Employee Added',
            'employee:update': 'Employee Updated',
            'employee:delete': 'Employee Deleted',
          }[notification.type]} → <strong>{notification.name}</strong>
        </div>
      )}

      <EmployeeForm
        form={form}
        editData={editData}
        handleChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        handleSubmit={handleSubmit}
        onCancel={() => {
          setForm({ name: '', email: '', department: '' });
          setEditData(null);
        }}
      />

      <EmployeeSearch
        searchId={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        onSearch={handleSearch}
        onClear={clearSearch}
        isSearching={isSearching}
      />

      <EmployeeTable
        employees={employees}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {stats && (
        <div className="mt-5">
          <h5>📊 API Usage Analytics</h5>
          <ul className="list-group">
            <li className="list-group-item">Logins: {stats['analytics:logins']}</li>
            <li className="list-group-item">Registrations: {stats['analytics:registers']}</li>
            <li className="list-group-item">Fetched Employees: {stats['analytics:getEmployees']}</li>
            <li className="list-group-item">Added Employees: {stats['analytics:addEmployee']}</li>
            <li className="list-group-item">Updated Employees: {stats['analytics:updateEmployee']}</li>
            <li className="list-group-item">Deleted Employees: {stats['analytics:deleteEmployee']}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
