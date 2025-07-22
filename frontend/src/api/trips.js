import axios from 'axios';

const API_URL = 'http://localhost:4000/api/trips';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getTrips = async () => {
  try {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};

export const createTrip = async (tripData) => {
  try {
    const response = await axios.post(API_URL, tripData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const updateTrip = async (id, tripData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, tripData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};
