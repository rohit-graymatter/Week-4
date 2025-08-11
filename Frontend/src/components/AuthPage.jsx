import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { registerUser, loginUser } from '../Services/authService';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (!isLogin && !form.name)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields',
      });
    }

    try {
      const response = isLogin
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser({ name: form.name, email: form.email, password: form.password });

      if (![200, 201].includes(response.status)) throw new Error();

      const { token, user } = response.data;

      // Save token & user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        icon: 'success',
        title: isLogin ? 'Login successful' : 'Registration successful',
      });

      onLogin(user, token);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>

      {isLogin && (
        <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          Only 3 login attempts allowed. After that, your account will be locked for 2 minutes.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-3">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        )}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p className="text-center mt-3">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          className="btn btn-link"
          onClick={() => {
            setIsLogin(!isLogin);
            setForm({ name: '', email: '', password: '' });
          }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
