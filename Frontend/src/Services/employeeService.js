import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/employees';

const config = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getEmployees = (token) => axios.get(BASE_URL, config(token));
export const getEmployeeById = (id, token) => axios.get(`${BASE_URL}/${id}`, config(token));
export const addEmployee = (employee, token) => axios.post(BASE_URL, employee, config(token));
export const updateEmployee = (id, updatedData, token) => axios.put(`${BASE_URL}/${id}`, updatedData, config(token));
export const deleteEmployee = (id, token) => axios.delete(`${BASE_URL}/${id}`, config(token));
