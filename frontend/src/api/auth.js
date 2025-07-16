import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth'; // Replace with your backend URL

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const logoutUser = async () => {
  await axios.get(`${API_URL}/logout`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
};

export const getCurrentUser = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};