import axios from 'axios';

const API_URL = 'http://localhost:4000/api/vehicles';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getVehicles = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const response = await axios.post(API_URL, vehicleData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, vehicleData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};
