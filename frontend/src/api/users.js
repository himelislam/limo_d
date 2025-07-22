import api from './index';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data.data; // Extract data from success response
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};
