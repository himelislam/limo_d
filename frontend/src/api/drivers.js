import api from './index';

const API_URL = '/drivers';

export const getDrivers = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getDriver = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post(API_URL, driverData);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`${API_URL}/${id}`, driverData);
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

// Public driver registration
export const registerDriver = async (driverData) => {
  const response = await api.post(`${API_URL}/register`, driverData);
  return response.data;
};
