import axios from 'axios';

const API_URL = 'http://localhost:4000/api/trips';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getTrips = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { 
      headers: getAuthHeaders(),
      params 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return { data: [] };
  }
};

export const getPendingTrips = async () => {
  try {
    const response = await axios.get(`${API_URL}/pending`, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending trips:', error);
    return { data: [] };
  }
};

export const getAvailableResources = async (tripId) => {
  try {
    const response = await axios.get(`${API_URL}/${tripId}/available-resources`, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available resources:', error);
    throw error;
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

export const assignTrip = async (tripId, assignmentData) => {
  try {
    const response = await axios.put(`${API_URL}/${tripId}/assign`, assignmentData, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning trip:', error);
    throw error;
  }
};

export const updateTripStatus = async (tripId, statusData) => {
  try {
    const response = await axios.put(`${API_URL}/${tripId}/status`, statusData, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error updating trip status:', error);
    throw error;
  }
};

export const addTripFeedback = async (tripId, feedbackData) => {
  try {
    const response = await axios.put(`${API_URL}/${tripId}/feedback`, feedbackData, { 
      headers: getAuthHeaders() 
    });
    return response.data;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
};

export const updateTrip = updateTripStatus; // Backward compatibility
