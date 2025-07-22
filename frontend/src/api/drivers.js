import axios from 'axios';

const API_URL = 'http://localhost:4000/api/drivers';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getDrivers = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
};

export const createDriver = async (driverData) => {
  try {
    const response = await axios.post(API_URL, driverData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
};

export const updateDriver = async (id, driverData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, driverData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
};

export const deleteDriver = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};
